const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const auth = require("../middleware/auth");

// @route   POST /api/auth/register
// @access  Public
router.post("/register", register);

// @route   POST /api/auth/login
// @access  Public
router.post("/login", login);

// @route   GET /api/auth/me
// @access  Protected
router.get("/me", auth, getMe);

module.exports = router;
