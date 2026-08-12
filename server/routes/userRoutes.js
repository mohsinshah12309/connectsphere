const express = require("express");
const router = express.Router();
const {
  searchUsers,
  getUserProfile,
  updateUserProfile,
  toggleFollow,
  getFollowers,
  getFollowing,
} = require("../controllers/userController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

// @route   GET /api/users/search?q=
// @access  Protected
// NOTE: must be defined before the /:id route, or "search" will be
// treated as an :id param and never reach this handler
router.get("/search", auth, searchUsers);

// @route   GET /api/users/:id
// @access  Protected
router.get("/:id", auth, getUserProfile);

// @route   PUT /api/users/:id
// @access  Protected — owner only
router.put(
  "/:id",
  auth,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
  ]),
  updateUserProfile,
);

// @route   POST /api/users/:id/follow
// @access  Protected — toggle follow/unfollow
router.post("/:id/follow", auth, toggleFollow);

// @route   GET /api/users/:id/followers
// @access  Protected
router.get("/:id/followers", auth, getFollowers);

// @route   GET /api/users/:id/following
// @access  Protected
router.get("/:id/following", auth, getFollowing);

module.exports = router;
