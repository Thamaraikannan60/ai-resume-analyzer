// backend/routes/auth.js

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // ✅ FIXED PATH

// ───────────────────────────────────────
// Helper: Create JWT Token
// ───────────────────────────────────────
const createToken = (userId) => {
  return jwt.sign(
    { id: userId },           // payload
    process.env.JWT_SECRET,   // secret key
    { expiresIn: process.env.JWT_EXPIRE } // expiry
  );
};

// ───────────────────────────────────────
// POST /api/auth/signup
// ───────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide name, email and password'
      });
    }

    // 2. Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already registered'
      });
    }

    // 3. Create new user (password will be hashed automatically)
    const user = await User.create({ name, email, password });

    // 4. Generate token
    const token = createToken(user._id);

    // 5. Send response
    res.status(201).json({
      status: 'success',
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.log("SIGNUP ERROR:", error); // ✅ DEBUG LOG

    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// ───────────────────────────────────────
// POST /api/auth/login
// ───────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // 3. Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // 4. Generate token
    const token = createToken(user._id);

    // 5. Send response
    res.json({
      status: 'success',
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error); // ✅ DEBUG LOG

    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;