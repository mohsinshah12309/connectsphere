const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const { emitNotification } = require("../socket/notificationSocket");

// @desc    Add a comment to a post
// @route   POST /api/comments
// @access  Protected
exports.createComment = async (req, res, next) => {
  try {
    const { text, postId } = req.body;

    if (!text || !text.trim()) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Comment text is required",
          errors: [],
        });
    }
    if (!postId) {
      return res
        .status(400)
        .json({ success: false, message: "postId is required", errors: [] });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found", errors: [] });
    }

    const comment = await Comment.create({
      text,
      author: req.user._id,
      post: postId,
    });

    // Keep the post's comments array in sync
    post.comments.push(comment._id);
    await post.save();

    const populatedComment = await comment.populate("author", "name avatar");

    // Notify the post's author, unless they're commenting on their own post
    if (post.author.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: "comment",
        post: post._id,
      });
      const io = req.app.get("io");
      emitNotification(io, post.author.toString(), notification);
    }

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: { comment: populatedComment, commentsCount: post.comments.length },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all comments for a post
// @route   GET /api/comments/post/:postId
// @access  Protected
exports.getCommentsByPost = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .sort({ createdAt: -1 })
      .populate("author", "name avatar");

    res.status(200).json({
      success: true,
      message: "Comments fetched successfully",
      data: { comments },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment - allowed for comment author OR post author
// @route   DELETE /api/comments/:id
// @access  Protected
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found", errors: [] });
    }

    const post = await Post.findById(comment.post);

    const userId = req.user._id.toString();
    const isCommentAuthor = comment.author.toString() === userId;
    const isPostAuthor = post && post.author.toString() === userId;

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({
        success: false,
        message:
          "Only the comment author or post author can delete this comment",
        errors: [],
      });
    }

    if (post) {
      post.comments = post.comments.filter(
        (id) => id.toString() !== comment._id.toString(),
      );
      await post.save();
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
