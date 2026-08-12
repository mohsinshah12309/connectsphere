const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");
const auth = require("../middleware/auth");

// @route   GET /api/notifications
// @access  Protected
router.get("/", auth, getNotifications);

// @route   PATCH /api/notifications/mark-all-read
// @access  Protected
// NOTE: must come before /:id/read so "mark-all-read" isn't parsed as an :id
router.patch("/mark-all-read", auth, markAllAsRead);

// @route   PATCH /api/notifications/:id/read
// @access  Protected
router.patch("/:id/read", auth, markAsRead);

module.exports = router;
