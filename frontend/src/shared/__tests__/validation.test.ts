import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, validateRequired } from '../utils/validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('test+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should accept passwords with 6 or more characters', () => {
      expect(validatePassword('123456')).toEqual({ valid: true });
      expect(validatePassword('password123')).toEqual({ valid: true });
    });

    it('should reject passwords with less than 6 characters', () => {
      expect(validatePassword('12345')).toEqual({
        valid: false,
        message: 'Password must be at least 6 characters',
      });
      expect(validatePassword('')).toEqual({
        valid: false,
        message: 'Password must be at least 6 characters',
      });
    });
  });

  describe('validateRequired', () => {
    it('should accept non-empty values', () => {
      expect(validateRequired('value', 'Field')).toEqual({ valid: true });
      expect(validateRequired('test', 'Field')).toEqual({ valid: true });
    });

    it('should reject empty values', () => {
      expect(validateRequired('', 'Field')).toEqual({
        valid: false,
        message: 'Field is required',
      });
      expect(validateRequired('   ', 'Field')).toEqual({
        valid: false,
        message: 'Field is required',
      });
    });
  });
});
