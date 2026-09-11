import { describe, it, expect, vi } from 'vitest';
import { generateAccessToken, verifyAccessToken, generateRefreshToken, hashToken } from '../src/utils/tokens.js';
import { AppError } from '../src/utils/errors.js';
import { UserRole } from '@prisma/client';

describe('Authentication & Token Security Suite', () => {
  const mockUser = {
    sub: 'user-uuid-1234',
    email: 'dev1@velozity.dev',
    role: UserRole.DEVELOPER,
    name: 'Alex Chen',
  };

  it('generates a valid JWT access token and verifies its payload', () => {
    const token = generateAccessToken(mockUser);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe(mockUser.sub);
    expect(decoded.email).toBe(mockUser.email);
    expect(decoded.role).toBe(mockUser.role);
  });

  it('rejects an invalid or tampered JWT access token with TOKEN_INVALID', () => {
    const tampered = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsignature';
    expect(() => verifyAccessToken(tampered)).toThrowError(AppError);
    try {
      verifyAccessToken(tampered);
    } catch (err: unknown) {
      expect((err as AppError).code).toBe('TOKEN_INVALID');
      expect((err as AppError).statusCode).toBe(401);
    }
  });

  it('generates a cryptographically strong refresh token and produces consistent SHA-256 hash', () => {
    const { token, hash, expiresAt } = generateRefreshToken();
    expect(token).toHaveLength(128); // 64 bytes hex
    expect(hash).toHaveLength(64); // sha-256 hex
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());

    // SHA-256 is deterministic
    expect(hashToken(token)).toBe(hash);
  });
});
