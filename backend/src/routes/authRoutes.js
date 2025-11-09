const express = require("express");
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getProfile, 
  updateProfile, 
  changePassword 
} = require("../controllers/authController");
const authenticate = require("../middlewares/authMiddleware");

// Public routes
router.post("/register", registerUser); // Disabled, returns 403
router.post("/login", loginUser);

// Protected routes
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.post("/change-password", authenticate, changePassword);

module.exports = router;

