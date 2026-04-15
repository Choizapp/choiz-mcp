import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { getContext, getJwt } from './context.js';
import { handleError, toolResult } from './shared.js';

export const mergeAccountsInputShape = {
  email: z.string().email().describe('Email of the account to be merged (will be deleted)'),
  phone: z
    .string()
    .describe('Phone of the target account that will absorb the email account'),
};

type Input = { email: string; phone: string };

export const mergeAccountsTool = {
  name: 'merge_accounts',
  description:
    'Merge two accounts: one identified by email, another by phone. The email account is deleted and its data is transferred to the phone account. NOTE: this calls login-core directly (not through choiz-core) because there is no proxy endpoint.',
  inputShape: mergeAccountsInputShape,
  handler: async (input: Input): Promise<CallToolResult> => {
    const ctx = getContext();
    const jwt = await getJwt();
    try {
      await ctx.loginCore.mergeAccounts({ userName: input.email, phone: input.phone }, jwt);
      return toolResult(
        `Accounts merged. Email account "${input.email}" transferred into phone account "${input.phone}".`,
      );
    } catch (err) {
      return handleError(err);
    }
  },
};
