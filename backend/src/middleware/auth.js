const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const config = require('../config/environment');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Please provide a valid token.', 401);
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      throw new AppError('Authentication required. Please log in.', 401);
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    
    if (!decoded.userId) {
      throw new AppError('Invalid token payload.', 401);
    }

    req.userId = decoded.userId;
    req.token = token;
    
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Authentication failed. Please log in again.', 401));
    }
  }
};

module.exports = auth;