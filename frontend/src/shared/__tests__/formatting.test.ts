import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, truncateText } from '../utils/formatting';

describe('Formatting Utils', () => {
  describe('formatDate', () => {
    it('should format date string', () => {
      const date = '2024-01-15T10:30:00Z';
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Jan 15, 2024/);
    });

    it('should format Date object', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Jan 15, 2024/);
    });
  });

  describe('formatDateTime', () => {
    it('should format date with time', () => {
      const date = '2024-01-15T10:30:00Z';
      const formatted = formatDateTime(date);
      expect(formatted).toContain('Jan 15, 2024');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const text = 'This is a very long text that should be truncated';
      const truncated = truncateText(text, 20);
      expect(truncated).toBe('This is a very long ...');
      expect(truncated.length).toBeLessThanOrEqual(23);
    });

    it('should not truncate short text', () => {
      const text = 'Short text';
      const truncated = truncateText(text, 20);
      expect(truncated).toBe('Short text');
    });

    it('should handle exact length', () => {
      const text = 'Exact';
      const truncated = truncateText(text, 5);
      expect(truncated).toBe('Exact');
    });
  });
});
