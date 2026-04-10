import { describe, it, expect, beforeAll } from 'vitest';
import { hashPassword, verifyPassword, validatePasswordStrength, generateSecurePassword } from '../lib/auth';

describe('Auth Utilities', () => {
  describe('hashPassword & verifyPassword', () => {
    it('should hash and verify password correctly', async () => {
      const password = 'TestPass123!';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(await verifyPassword(password, hash)).toBe(true);
    });

    it('should return false for wrong password', async () => {
      const password = 'TestPass123!';
      const wrongPassword = 'WrongPass123!';
      const hash = await hashPassword(password);
      
      expect(await verifyPassword(wrongPassword, hash)).toBe(false);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'TestPass123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2); // Different salts
      expect(await verifyPassword(password, hash1)).toBe(true);
      expect(await verifyPassword(password, hash2)).toBe(true);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong password', () => {
      const result = validatePasswordStrength('StrongPass123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject short password', () => {
      const result = validatePasswordStrength('Short1');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('La contraseña debe tener al menos 8 caracteres');
    });

    it('should reject password without uppercase', () => {
      const result = validatePasswordStrength('lowercase123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Debe contener al menos una mayúscula');
    });

    it('should reject password without lowercase', () => {
      const result = validatePasswordStrength('UPPERCASE123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Debe contener al menos una minúscula');
    });

    it('should reject password without number', () => {
      const result = validatePasswordStrength('NoNumbersHere');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Debe contener al menos un número');
    });
  });

  describe('generateSecurePassword', () => {
    it('should generate password of specified length', () => {
      const password = generateSecurePassword(16);
      expect(password).toHaveLength(16);
    });

    it('should generate different passwords each time', () => {
      const password1 = generateSecurePassword();
      const password2 = generateSecurePassword();
      expect(password1).not.toBe(password2);
    });

    it('should generate valid strong passwords', () => {
      const password = generateSecurePassword(16);
      const validation = validatePasswordStrength(password);
      expect(validation.valid).toBe(true);
    });
  });
});
