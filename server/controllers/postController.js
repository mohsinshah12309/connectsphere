const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const { emitNotification } = require("../socket/notificationSocket");

// @desc    Create a post with optional image
// @route   POST /api/posts
// @access  Protected
exports.createPost = async (req, res, next) => {
  try {
    const { content, tags } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Post content is required",
        errors: [],
      });
    }

    const parsedTags = tags
      ? (Array.isArray(tags) ? tags : tags.split(","))
          .map((t) => t.trim())
          .slice(0, 5)
      : [];

    const post = await Post.create({
      content,
      image: req.file ? req.file.path : "",
      author: req.user._id,
      tags: parsedTags,
    });

    const populatedPost = await post.populate("author", "name avatar");

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: { post: populatedPost },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts, paginated (Explore page)
// @route   GET /api/posts
// @access  Protected
exports.getExplorePosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "name avatar"),
      Post.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get posts from the logged-in user + everyone they follow
// @route   GET /api/posts/feed
// @access  Protected
exports.getFeedPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Own posts + posts from everyone the user follows
    const authorIds = [req.user._id, ...req.user.following];

    const [posts, total] = await Promise.all([
      Post.find({ author: { $in: authorIds } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "name avatar"),
      Post.countDocuments({ author: { $in: authorIds } }),
    ]);

    res.status(200).json({
      success: true,
      message: "Feed fetched successfully",
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single post with author + comments populated
// @route   GET /api/posts/:id
// @access  Protected
exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name avatar")
      .populate({
        path: "comments",
        populate: { path: "author", select: "name avatar" },
        options: { sort: { createdAt: -1 } },
      });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found", errors: [] });
    }

    res.status(200).json({
      success: true,
      message: "Post fetched successfully",
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update own post
// @route   PUT /api/posts/:id
// @access  Protected — owner only
exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found", errors: [] });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own posts",
        errors: [],
      });
    }

    const { content, tags } = req.body;

    if (content !== undefined) post.content = content;
    if (tags !== undefined) {
      post.tags = (Array.isArray(tags) ? tags : tags.split(","))
        .map((t) => t.trim())
        .slice(0, 5);
    }
    if (req.file) post.image = req.file.path;

    await post.save();
    const populatedPost = await post.populate("author", "name avatar");

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: { post: populatedPost },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete own post (cascades comment deletion)
// @route   DELETE /api/posts/:id
// @access  Protected — owner only
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found", errors: [] });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts",
        errors: [],
      });
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: "Post and its comments deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like/unlike on a post
// @route   PATCH /api/posts/:id/like
// @access  Protected
exports.toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found", errors: [] });
    }

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    // Notify the post's author, but never notify yourself for liking your own post
    if (!alreadyLiked && post.author.toString() !== userId) {
      const notification = await Notification.create({
        recipient: post.author,
        sender: userId,
        type: "like",
        post: post._id,
      });
      const io = req.app.get("io");
      emitNotification(io, post.author.toString(), notification);
    }

    res.status(200).json({
      success: true,
      message: alreadyLiked ? "Post unliked" : "Post liked",
      data: {
        isLiked: !alreadyLiked,
        likesCount: post.likes.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
