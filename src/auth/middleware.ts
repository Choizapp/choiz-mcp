import type { NextFunction, Request, Response } from 'express';
import type { JwtClaims } from '../types/api.js';

/**
 * Decodes a JWT payload without verifying the signature.
 * Trust model: the token was issued by login-core via our own TokenManager,
 * and we validate expiration + claims where needed.
 */
export function decodeJwtPayload(token: string): JwtClaims | null {
  const parts = token.split('.');
  if (parts.length !== 3 || !parts[1]) return null;
  try {
    const payload = Buffer.from(parts[1], 'base64url').toString('utf-8');
    return JSON.parse(payload) as JwtClaims;
  } catch {
    return null;
  }
}

export function isAdminFromClaims(claims: JwtClaims): boolean {
  const authorities = (claims.CLAIM_TOKEN ?? '').split(',').map((s) => s.trim());
  return authorities.some((a) => a === 'ROLE_ADMIN' || a === 'ADMIN');
}

/**
 * Simple API key middleware. Checks `Authorization: Bearer <key>` or `x-api-key: <key>`.
 * Stateless — just compares against the expected value.
 */
export function apiKeyAuth(expectedKey: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const xApiKey = req.headers['x-api-key'];
    const provided = bearer ?? xApiKey;

    if (!provided || provided !== expectedKey) {
      res.status(401).json({ error: 'invalid_api_key' });
      return;
    }
    next();
  };
}
