export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly service: string,
    public readonly endpoint: string,
    public readonly body: unknown,
    message?: string,
  ) {
    super(message ?? `${service} ${endpoint} failed with ${status}`);
    this.name = 'ApiError';
  }

  toText(): string {
    const bodyStr = typeof this.body === 'string' ? this.body : JSON.stringify(this.body, null, 2);
    return `Error calling ${this.service} ${this.endpoint}\nStatus: ${this.status}\nDetails: ${bodyStr}`;
  }
}

export type AuthErrorCode = 'MISSING_TOKEN' | 'INVALID_TOKEN' | 'EXPIRED' | 'NOT_ADMIN';

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: AuthErrorCode,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
