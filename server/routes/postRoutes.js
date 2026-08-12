const express = require("express");
const router = express.Router();
const {
  createPost,
  getExplorePosts,
  getFeedPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
} = require("../controllers/postController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

// @route   POST /api/posts
// @access  Protected — supports image upload
router.post("/", auth, upload.single("image"), createPost);

// @route   GET /api/posts
// @access  Protected — explore feed, paginated
router.get("/", auth, getExplorePosts);

// @route   GET /api/posts/feed
// @access  Protected — posts from followed users + own
// NOTE: must come before /:id so "feed" isn't swallowed as an id param
router.get("/feed", auth, getFeedPosts);

// @route   GET /api/posts/:id
// @access  Protected — full post with author + comments populated
router.get("/:id", auth, getPostById);

// @route   PUT /api/posts/:id
// @access  Protected — owner only
router.put("/:id", auth, upload.single("image"), updatePost);

// @route   DELETE /api/posts/:id
// @access  Protected — owner only, cascades comment deletion
router.delete("/:id", auth, deletePost);

// @route   PATCH /api/posts/:id/like
// @access  Protected — toggle like
router.patch("/:id/like", auth, toggleLike);

module.exports = router;
