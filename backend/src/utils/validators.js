const validator = require('validator');

const validateEmail = (email) => {
  return validator.isEmail(email) && email.length <= 255;
};

const validatePassword = (password) => {
  return password.length >= 8 && password.length <= 100;
};

const validateFullName = (name) => {
  return name && name.length >= 2 && name.length <= 100;
};

const validateTask = (task) => {
  const { title, description, status, due_date } = task;
  if (!title || title.length < 1 || title.length > 255) {
    return { valid: false, error: 'Title must be between 1 and 255 characters' };
  }
  if (description && description.length > 1000) {
    return { valid: false, error: 'Description cannot exceed 1000 characters' };
  }
  if (status && !['pending', 'in-progress', 'completed', 'cancelled'].includes(status)) {
    return { valid: false, error: 'Invalid status value' };
  }
  if (due_date && !validator.isISO8601(due_date)) {
    return { valid: false, error: 'Invalid date format' };
  }
  return { valid: true };
};

module.exports = {
  validateEmail,
  validatePassword,
  validateFullName,
  validateTask,
};