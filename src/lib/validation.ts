/**
 * Validation helpers for form inputs across StudySpace
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateRequired(value: string | number | null | undefined, fieldName: string): ValidationResult {
  if (value === null || value === undefined || String(value).trim() === '') {
    return { isValid: false, error: `${fieldName} is required.` };
  }
  return { isValid: true };
}

export function validatePositiveNumber(value: number | string | null | undefined, fieldName: string): ValidationResult {
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    return { isValid: false, error: `${fieldName} must be a positive number greater than 0.` };
  }
  return { isValid: true };
}

export function validateNonNegativeNumber(value: number | string | null | undefined, fieldName: string): ValidationResult {
  const num = Number(value);
  if (isNaN(num) || num < 0) {
    return { isValid: false, error: `${fieldName} cannot be negative.` };
  }
  return { isValid: true };
}

export function validateContactNumber(phone: string | null | undefined): ValidationResult {
  if (!phone || phone.trim() === '') {
    return { isValid: true }; // Optional field
  }
  const cleanPhone = phone.trim();
  // Standard Indian 10-digit mobile number or general 10-digit pattern
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return {
      isValid: false,
      error: 'Please enter a valid 10-digit Indian mobile number starting with 6-9.',
    };
  }
  return { isValid: true };
}

export function validateStudentCode(code: string | null | undefined): ValidationResult {
  if (!code || code.trim() === '') {
    return { isValid: false, error: 'Student Code is required.' };
  }
  const cleanCode = code.trim();
  if (cleanCode.length < 3 || cleanCode.length > 20) {
    return { isValid: false, error: 'Student Code must be between 3 and 20 characters.' };
  }
  // Alphanumeric, hyphen, underscore
  const codeRegex = /^[A-Za-z0-9\-_]+$/;
  if (!codeRegex.test(cleanCode)) {
    return { isValid: false, error: 'Student Code can only contain letters, numbers, hyphens, and underscores.' };
  }
  return { isValid: true };
}
