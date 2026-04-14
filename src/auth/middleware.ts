import type { JwtClaims } from '../types/api.js';

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
