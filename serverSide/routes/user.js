const express = require('express');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the directory to store images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp as filename
  },
});

const upload = multer({ storage: storage });

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  const userId = req.user.id; 
  try {
    const user = await User.findById(userId).select('-password');
    res.json(user); 
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

// Update user profile (including images)
router.post('/updateProfile', verifyToken, upload.fields([
  { name: 'profileImg', maxCount: 1 },
  { name: 'coverImg', maxCount: 1 }
]), async (req, res) => {
  const userId = req.user.id; 
  const userData = {
    username: req.body.userName,
    worksAt: req.body.worksAt,
    livesIn: req.body.livesIn,
    country: req.body.country,
    relationshipStatus: req.body.relationshipStatus,
  };

  // Check and add profile image if uploaded
  if (req.files.profileImg) {
    userData.profilePicture = req.files.profileImg[0].path; 
  }

  // Check and add cover image if uploaded
  if (req.files.coverImg) {
    userData.coverPicture = req.files.coverImg[0].path; 
  }

  // Update user data in the database
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, userData, { new: true });
    res.json(updatedUser); 
  } catch (error) {
    res.status(500).json({ error: "Failed to update user profile" });
  }
});

module.exports = router;
