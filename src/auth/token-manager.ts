import { decodeJwtPayload } from './middleware.js';

export interface TokenManagerOptions {
  loginUrl: string;
  loginApiKey: string;
  email: string;
  password: string;
}

/**
 * Manages a single admin JWT: logs in to login-core on first use,
 * caches the token, and auto-refreshes when it's close to expiring.
 */
export class TokenManager {
  private jwt: string | null = null;
  private username = '';
  private expiresAt = 0;
  private refreshPromise: Promise<string> | null = null;

  constructor(private readonly opts: TokenManagerOptions) {}

  /** Returns a valid JWT, refreshing if needed. */
  async getToken(): Promise<string> {
    const MARGIN_MS = 5 * 60 * 1000; // refresh 5 min before expiry
    if (this.jwt && this.expiresAt > Date.now() + MARGIN_MS) {
      return this.jwt;
    }
    // Deduplicate concurrent refresh calls
    if (!this.refreshPromise) {
      this.refreshPromise = this.login().finally(() => {
        this.refreshPromise = null;
      });
    }
    return this.refreshPromise;
  }

  getUsername(): string {
    return this.username;
  }

  /** Force a re-login on the next getToken() call. */
  invalidate(): void {
    this.jwt = null;
    this.expiresAt = 0;
  }

  private async login(): Promise<string> {
    const response = await fetch(`${this.opts.loginUrl}/login/credentials/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.opts.loginApiKey,
      },
      body: JSON.stringify({
        userName: this.opts.email,
        password: this.opts.password,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`login-core signin failed (${response.status}): ${body}`);
    }

    const data = (await response.json()) as { accessToken: string; username: string };
    this.jwt = data.accessToken;
    this.username = data.username;

    const claims = decodeJwtPayload(this.jwt);
    // Default to 9h if we can't read exp (real TTL is 10h)
    this.expiresAt = claims?.exp ? claims.exp * 1000 : Date.now() + 9 * 60 * 60 * 1000;

    return this.jwt;
  }
}
