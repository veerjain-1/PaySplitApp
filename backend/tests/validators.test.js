const { validateEmail, validateAmount } = require('../src/utils/validators');

test('validates email format', () => {
  expect(validateEmail('test@example.com')).toBe(true);
  expect(validateEmail('invalid-email')).toBe(false);
});

test('validates positive amount', () => {
  expect(validateAmount(10)).toBe(true);
  expect(validateAmount(-5)).toBe(false);
  expect(validateAmount('100')).toBe(false);
});
