import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { getContext, getJwt } from './context.js';
import { handleError, toolResult } from './shared.js';

export const enableSubscriptionInputShape = {
  clientId: z.number().int().positive().describe('Client ID (from get_treatments)'),
  treatmentId: z.number().int().positive().describe('Treatment ID (from get_treatments)'),
};

type Input = { clientId: number; treatmentId: number };

export const enableSubscriptionTool = {
  name: 'enable_subscription',
  description:
    'Re-enable (activate) a treatment subscription for a client. Calls choiz-core /clients/{id}/treatment/{tid}/subscription/enable. Use get_treatments first to obtain clientId and treatmentId.',
  inputShape: enableSubscriptionInputShape,
  handler: async (input: Input): Promise<CallToolResult> => {
    const ctx = getContext();
    const jwt = await getJwt();
    try {
      await ctx.choizCore.enableSubscription(input.clientId, input.treatmentId, jwt);
      return toolResult(
        `Subscription enabled: clientId=${input.clientId} treatmentId=${input.treatmentId}. Follow-up status and chat conversation updated.`,
      );
    } catch (err) {
      return handleError(err);
    }
  },
};
