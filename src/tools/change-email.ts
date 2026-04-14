import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { getContext, getJwt } from './context.js';
import { handleError, toolResult } from './shared.js';

export const changeEmailInputShape = {
  oldEmail: z.string().email().describe('Current account email'),
  newEmail: z.string().email().describe('New email to assign to the account'),
};

type Input = { oldEmail: string; newEmail: string };

export const changeEmailTool = {
  name: 'change_email',
  description:
    'Change a user email across all Choiz services. Calls choiz-core /clients/emails which orchestrates updates in login-core, my-account-core, medical-form-core, chat-core, and notification-core. Admin JWT required.',
  inputShape: changeEmailInputShape,
  handler: async (input: Input): Promise<CallToolResult> => {
    const ctx = getContext();
    const jwt = await getJwt();
    if (input.oldEmail === input.newEmail) {
      return toolResult('No change — old and new email are the same.');
    }
    try {
      await ctx.choizCore.changeEmail(input.oldEmail, input.newEmail, jwt);
      return toolResult(
        `Email changed: ${input.oldEmail} → ${input.newEmail}. Propagated across login, my-account, medical-form, chat, and notification services.`,
      );
    } catch (err) {
      return handleError(err);
    }
  },
};
