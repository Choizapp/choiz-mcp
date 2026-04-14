import { AsyncLocalStorage } from 'node:async_hooks';
import type { TokenManager } from '../auth/token-manager.js';
import type { ChoizCoreClient } from '../clients/choiz-core.client.js';
import type { LoginCoreClient } from '../clients/login-core.client.js';
import type { MyAccountCoreClient } from '../clients/my-account.client.js';

export interface ToolContext {
  tokenManager: TokenManager;
  loginCore: LoginCoreClient;
  choizCore: ChoizCoreClient;
  myAccount: MyAccountCoreClient;
}

export const contextStorage = new AsyncLocalStorage<ToolContext>();

export function getContext(): ToolContext {
  const ctx = contextStorage.getStore();
  if (!ctx) {
    throw new Error('Tool context not available — middleware did not run');
  }
  return ctx;
}

/** Returns a fresh JWT (auto-refreshes if close to expiry). */
export async function getJwt(): Promise<string> {
  return getContext().tokenManager.getToken();
}

export function getUsername(): string {
  return getContext().tokenManager.getUsername();
}
