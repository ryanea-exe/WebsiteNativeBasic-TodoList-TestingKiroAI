import { describe, it, expect } from 'vitest';
import { isValidTitle, getValidationError } from '../../app.js';

// =============================================================================
// isValidTitle()
// =============================================================================

describe('isValidTitle()', () => {
  // --- Valid inputs ---
  it('returns true for a normal title', () => {
    expect(isValidTitle('Beli susu')).toBe(true);
  });

  it('returns true for a single non-whitespace character', () => {
    expect(isValidTitle('x')).toBe(true);
  });

  it('returns true for a title with surrounding whitespace', () => {
    expect(isValidTitle('  hello  ')).toBe(true);
  });

  it('returns true for a title that is only digits', () => {
    expect(isValidTitle('123')).toBe(true);
  });

  // --- Invalid inputs ---
  it('returns false for an empty string', () => {
    expect(isValidTitle('')).toBe(false);
  });

  it('returns false for a string of spaces', () => {
    expect(isValidTitle('   ')).toBe(false);
  });

  it('returns false for a tab character', () => {
    expect(isValidTitle('\t')).toBe(false);
  });

  it('returns false for a newline character', () => {
    expect(isValidTitle('\n')).toBe(false);
  });

  it('returns false for mixed whitespace only', () => {
    expect(isValidTitle(' \t\n ')).toBe(false);
  });

  it('returns false for a non-string value (number)', () => {
    expect(isValidTitle(42)).toBe(false);
  });

  it('returns false for null', () => {
    expect(isValidTitle(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isValidTitle(undefined)).toBe(false);
  });
});

// =============================================================================
// getValidationError()
// =============================================================================

describe('getValidationError()', () => {
  // --- Valid inputs (should return null) ---
  it('returns null for a valid title', () => {
    expect(getValidationError('Beli susu')).toBeNull();
  });

  it('returns null for a title with surrounding whitespace', () => {
    expect(getValidationError('  belajar  ')).toBeNull();
  });

  // --- Invalid inputs (should return the Indonesian error message) ---
  it('returns the Indonesian error message for an empty string', () => {
    expect(getValidationError('')).toBe('Judul tugas tidak boleh kosong.');
  });

  it('returns the Indonesian error message for a whitespace-only string', () => {
    expect(getValidationError('   ')).toBe('Judul tugas tidak boleh kosong.');
  });

  it('returns the Indonesian error message for a tab-only string', () => {
    expect(getValidationError('\t')).toBe('Judul tugas tidak boleh kosong.');
  });

  it('returns the Indonesian error message for a mixed whitespace string', () => {
    expect(getValidationError(' \t\n ')).toBe('Judul tugas tidak boleh kosong.');
  });

  it('returns the Indonesian error message for null', () => {
    expect(getValidationError(null)).toBe('Judul tugas tidak boleh kosong.');
  });

  it('error message is exactly "Judul tugas tidak boleh kosong."', () => {
    const msg = getValidationError('');
    expect(msg).toBe('Judul tugas tidak boleh kosong.');
  });
});
