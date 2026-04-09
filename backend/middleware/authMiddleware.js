// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    // Step 1: Get token from request headers
    const authHeader = req.headers.authorization;
    // Token is sent like: "Bearer eyJhbGc..."

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token. Please login first.'
      });
    }

    // Step 2: Extract just the token
    const token = authHeader.split(' ')[1];
    // "Bearer eyJhbGc..." → ["Bearer", "eyJhbGc..."] → [1]

    // Step 3: Verify token is valid + not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id: "userId", iat: ..., exp: ... }

    // Step 4: Find the user from token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User no longer exists'
      });
    }

    // Step 5: Attach user to request
    req.user = user;
    // Now any route after this can use req.user

    next(); // continue to the actual route

  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token. Please login again.'
    });
  }
};

module.exports = protect;