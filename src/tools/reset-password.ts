import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { getContext, getJwt, getUsername } from './context.js';
import { handleError, toolResult } from './shared.js';

export const resetPasswordInputShape = {
  email: z.string().email().describe('Account email'),
  newPassword: z.string().min(6).describe('New password to set (minimum 6 characters)'),
};

type Input = { email: string; newPassword: string };

export const resetPasswordTool = {
  name: 'reset_password',
  description:
    'Admin-reset a user password. Calls login-core /admin/credentials/reset-password. Side effects: sets isPasswordSet=true, source=LOCAL, records the admin username in passwordModifiedBy.',
  inputShape: resetPasswordInputShape,
  handler: async (input: Input): Promise<CallToolResult> => {
    const ctx = getContext();
    const jwt = await getJwt();
    try {
      await ctx.loginCore.resetPasswordAsAdmin(input.email, input.newPassword, jwt);
      return toolResult(
        `Password reset for ${input.email}. The account is now active (isPasswordSet=true) and source=LOCAL. Recorded admin: ${getUsername()}.`,
      );
    } catch (err) {
      return handleError(err);
    }
  },
};
