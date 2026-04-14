import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ToolContext } from './tools/context.js';
import { contextStorage } from './tools/context.js';
import { allTools } from './tools/index.js';

/**
 * Creates an MCP server with all tools registered.
 *
 * If `ctx` is provided (stdio mode), each tool handler is wrapped so that
 * `contextStorage` is always available — the MCP SDK does not propagate
 * AsyncLocalStorage through its internal dispatch.
 */
export function createMcpServer(ctx?: ToolContext): McpServer {
  const server = new McpServer({
    name: 'choiz-account',
    version: '0.1.0',
  });

  for (const tool of allTools) {
    const handler = ctx
      ? // biome-ignore lint/suspicious/noExplicitAny: wrap handler with context
        (...args: any[]) => contextStorage.run(ctx, () => (tool.handler as any)(...args))
      : tool.handler;

    server.registerTool(
      tool.name,
      { description: tool.description, inputSchema: tool.inputShape },
      // biome-ignore lint/suspicious/noExplicitAny: MCP SDK handler type variance
      handler as any,
    );
  }

  return server;
}
