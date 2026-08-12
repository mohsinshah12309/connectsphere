const express = require("express");
const router = express.Router();
const {
  createComment,
  getCommentsByPost,
  deleteComment,
} = require("../controllers/commentController");
const auth = require("../middleware/auth");

// @route   POST /api/comments
// @access  Protected
router.post("/", auth, createComment);

// @route   GET /api/comments/post/:postId
// @access  Protected
router.get("/post/:postId", auth, getCommentsByPost);

// @route   DELETE /api/comments/:id
// @access  Protected — comment or post owner only
router.delete("/:id", auth, deleteComment);

module.exports = router;
