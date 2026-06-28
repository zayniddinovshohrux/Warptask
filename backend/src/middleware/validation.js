const { validateEmail, validatePassword, validateFullName, validateTask } = require('../utils/validators');

const validateRegister = (req, res, next) => {
  const { email, password, full_name } = req.body;
  
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters and max 100' });
  }
  if (!validateFullName(full_name)) {
    return res.status(400).json({ error: 'Full name must be between 2 and 100 characters' });
  }
  
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  next();
};

const validateTaskInput = (req, res, next) => {
  const { valid, error } = validateTask(req.body);
  if (!valid) {
    return res.status(400).json({ error });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateTaskInput,
};