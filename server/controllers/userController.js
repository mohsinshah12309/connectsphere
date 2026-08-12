const User = require("../models/User");
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const { emitNotification } = require("../socket/notificationSocket");

// @desc    Search users by name
// @route   GET /api/users/search?q=
// @access  Protected
exports.searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(200).json({
        success: true,
        message: "No query provided",
        data: { users: [] },
      });
    }

    const users = await User.find({
      name: { $regex: q, $options: "i" },
    })
      .select("name avatar bio")
      .limit(20);

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a user's public profile with their posts populated
// @route   GET /api/users/:id
// @access  Protected
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found", errors: [] });
    }

    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate("author", "name avatar");

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: {
        user,
        posts,
        followersCount: user.followers.length,
        followingCount: user.following.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update own profile - name, bio, avatar, cover photo
// @route   PUT /api/users/:id
// @access  Protected — owner only
exports.updateUserProfile = async (req, res, next) => {
  try {
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own profile",
        errors: [],
      });
    }

    const { name, bio } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;

    // multer.fields() -> req.files.avatar[0], req.files.coverPhoto[0]
    if (req.files?.avatar?.[0]) {
      updates.avatar = req.files.avatar[0].path; // Cloudinary URL
    }
    if (req.files?.coverPhoto?.[0]) {
      updates.coverPhoto = req.files.coverPhoto[0].path;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle follow/unfollow a user
// @route   POST /api/users/:id/follow
// @access  Protected
exports.toggleFollow = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const currentUserId = req.user._id.toString();

    if (targetId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
        errors: [],
      });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found", errors: [] });
    }

    const currentUser = await User.findById(currentUserId);
    const isFollowing = currentUser.following.some(
      (id) => id.toString() === targetId,
    );

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetId,
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUserId,
      );
    } else {
      // Follow
      currentUser.following.push(targetId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    // Create + emit notification only when following (not on unfollow)
    if (!isFollowing) {
      const notification = await Notification.create({
        recipient: targetId,
        sender: currentUserId,
        type: "follow",
      });
      const io = req.app.get("io");
      emitNotification(io, targetId, notification);
    }

    res.status(200).json({
      success: true,
      message: isFollowing
        ? "Unfollowed successfully"
        : "Followed successfully",
      data: {
        isFollowing: !isFollowing,
        followersCount: targetUser.followers.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a user's followers list
// @route   GET /api/users/:id/followers
// @access  Protected
exports.getFollowers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "followers",
      "name avatar bio",
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found", errors: [] });
    }

    res.status(200).json({
      success: true,
      message: "Followers fetched successfully",
      data: { followers: user.followers },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get who a user is following
// @route   GET /api/users/:id/following
// @access  Protected
exports.getFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "following",
      "name avatar bio",
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found", errors: [] });
    }

    res.status(200).json({
      success: true,
      message: "Following list fetched successfully",
      data: { following: user.following },
    });
  } catch (error) {
    next(error);
  }
};
