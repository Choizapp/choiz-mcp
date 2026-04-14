#!/usr/bin/env node
import 'dotenv/config';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { apiKeyAuth } from './auth/middleware.js';
import { TokenManager } from './auth/token-manager.js';
import { ChoizCoreClient } from './clients/choiz-core.client.js';
import { LoginCoreClient } from './clients/login-core.client.js';
import { MyAccountCoreClient } from './clients/my-account.client.js';
import { loadEnv } from './config/env.js';
import { createMcpServer } from './server.js';
import { contextStorage, type ToolContext } from './tools/context.js';

async function main(): Promise<void> {
  const env = loadEnv();

  const tokenManager = new TokenManager({
    loginUrl: env.LOGIN_CORE_BASE_URL,
    loginApiKey: env.LOGIN_CORE_API_KEY,
    email: env.CHOIZ_ADMIN_EMAIL,
    password: env.CHOIZ_ADMIN_PASSWORD,
  });

  // Fail fast if admin credentials are wrong
  await tokenManager.getToken();
  console.error(`Authenticated as ${tokenManager.getUsername()}`);

  const loginCore = new LoginCoreClient({
    baseUrl: env.LOGIN_CORE_BASE_URL,
    apiKey: env.LOGIN_CORE_API_KEY,
    service: 'login-core',
  });
  const choizCore = new ChoizCoreClient({
    baseUrl: env.CHOIZ_CORE_BASE_URL,
    apiKey: env.CHOIZ_CORE_API_KEY,
    service: 'choiz-core',
    checkoutApiKey: env.CHECKOUT_API_KEY,
  });
  const myAccount = new MyAccountCoreClient({
    baseUrl: env.MY_ACCOUNT_CORE_BASE_URL,
    apiKey: env.MY_ACCOUNT_CORE_API_KEY,
    service: 'my-account-core',
  });

  const makeContext = (): ToolContext => ({
    tokenManager,
    loginCore,
    choizCore,
    myAccount,
  });

  if (env.MCP_PORT) {
    await startHttp(env.MCP_PORT, env.MCP_API_KEY, makeContext);
  } else {
    await startStdio(makeContext);
  }
}

// ── stdio mode (npx / command) ─────────────────────────────────────────────

async function startStdio(makeContext: () => ToolContext): Promise<void> {
  const server = createMcpServer(makeContext());
  const transport = new StdioServerTransport();

  await server.connect(transport);
  console.error('Choiz Account MCP running (stdio)');
}

// ── HTTP mode (deployed server) ────────────────────────────────────────────

async function startHttp(
  port: number,
  apiKey: string,
  makeContext: () => ToolContext,
): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/mcp', apiKeyAuth(apiKey), async (req, res, next) => {
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      res.on('close', () => transport.close());

      const server = createMcpServer();
      await server.connect(transport);

      const ctx = makeContext();
      await contextStorage.run(ctx, async () => {
        await transport.handleRequest(req, res, req.body);
      });
    } catch (err) {
      console.error('[MCP] request failed:', err);
      next(err);
    }
  });

  app.get('/mcp', (_req, res) => res.status(405).json({ error: 'method_not_allowed' }));
  app.delete('/mcp', (_req, res) => res.status(405).json({ error: 'method_not_allowed' }));

  app.listen(port, () => {
    console.error(`Choiz Account MCP listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
