import { ApiError } from '../errors/api-error.js';

export interface ClientOptions {
  baseUrl: string;
  apiKey: string;
  service: string;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  jwt: string;
  headers?: Record<string, string>;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
}

export class BaseClient {
  constructor(protected readonly opts: ClientOptions) {}

  async request<T = unknown>(options: RequestOptions): Promise<T> {
    const url = this.buildUrl(options.path, options.query);
    const headers: Record<string, string> = {
      'x-api-key': this.opts.apiKey,
      Authorization: `Bearer ${options.jwt}`,
      ...(options.headers ?? {}),
    };

    const init: RequestInit = {
      method: options.method ?? 'GET',
      headers,
    };

    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, init);

    if (!response.ok) {
      const rawBody = await response.text();
      let parsedBody: unknown = rawBody;
      try {
        parsedBody = JSON.parse(rawBody);
      } catch {
        // keep raw string
      }
      throw new ApiError(response.status, this.opts.service, options.path, parsedBody);
    }

    const text = await response.text();
    if (!text) return undefined as T;

    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  private buildUrl(path: string, query?: Record<string, string | number | undefined>): string {
    const base = this.opts.baseUrl.endsWith('/')
      ? this.opts.baseUrl.slice(0, -1)
      : this.opts.baseUrl;
    const pathClean = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${base}${pathClean}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      }
    }
    return url.toString();
  }
}
