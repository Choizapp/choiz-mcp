import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ApiError } from '../errors/api-error.js';

export function toolResult(text: string): CallToolResult {
  return {
    content: [{ type: 'text', text }],
  };
}

export function toolError(text: string): CallToolResult {
  return {
    content: [{ type: 'text', text }],
    isError: true,
  };
}

export function handleError(err: unknown): CallToolResult {
  if (err instanceof ApiError) {
    return toolError(err.toText());
  }
  return toolError(err instanceof Error ? err.message : String(err));
}
