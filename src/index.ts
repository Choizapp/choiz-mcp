#!/usr/bin/env node
import 'dotenv/config';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { TokenManager } from './auth/token-manager.js';
import { ChoizCoreClient } from './clients/choiz-core.client.js';
import { LoginCoreClient } from './clients/login-core.client.js';
import { MyAccountCoreClient } from './clients/my-account.client.js';
import { loadEnv } from './config/env.js';
import { createMcpServer } from './server.js';

async function main(): Promise<void> {
  const env = loadEnv();

  const tokenManager = new TokenManager({
    loginUrl: env.LOGIN_CORE_BASE_URL,
    loginApiKey: env.LOGIN_CORE_API_KEY,
    email: env.CHOIZ_ADMIN_EMAIL,
    password: env.CHOIZ_ADMIN_PASSWORD,
  });

  await tokenManager.getToken();
  console.error(`Authenticated as ${tokenManager.getUsername()}`);

  const server = createMcpServer({
    tokenManager,
    loginCore: new LoginCoreClient({
      baseUrl: env.LOGIN_CORE_BASE_URL,
      apiKey: env.LOGIN_CORE_API_KEY,
      service: 'login-core',
    }),
    choizCore: new ChoizCoreClient({
      baseUrl: env.CHOIZ_CORE_BASE_URL,
      apiKey: env.CHOIZ_CORE_API_KEY,
      service: 'choiz-core',
      checkoutApiKey: env.CHECKOUT_API_KEY,
    }),
    myAccount: new MyAccountCoreClient({
      baseUrl: env.MY_ACCOUNT_CORE_BASE_URL,
      apiKey: env.MY_ACCOUNT_CORE_API_KEY,
      service: 'my-account-core',
    }),
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Choiz Account MCP running (stdio)');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
