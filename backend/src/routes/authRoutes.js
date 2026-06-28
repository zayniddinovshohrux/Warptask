const express = require('express');
const { 
  register, 
  login, 
  refreshToken, 
  logout, 
  logoutAll,
  getProfile 
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes (with rate limiting)
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshToken);

// Protected routes
router.post('/logout', auth, logout);
router.post('/logout-all', auth, logoutAll);
router.get('/profile', auth, getProfile);

module.exports = router;