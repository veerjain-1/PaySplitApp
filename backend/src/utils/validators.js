/**
 * Input validation utilities for PaySplitApp
 */

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validateAmount = (amount) => {
  return typeof amount === 'number' && amount > 0 && isFinite(amount);
};

const validateRequired = (fields, body) => {
  const missing = fields.filter((f) => !body[f]);
  return missing.length === 0 ? null : `Missing required fields: ${missing.join(', ')}`;
};

module.exports = { validateEmail, validateAmount, validateRequired };
