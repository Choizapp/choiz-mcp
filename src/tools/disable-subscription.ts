import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import type { CancellationRequest } from '../types/api.js';
import { getContext, getJwt } from './context.js';
import { handleError, toolResult } from './shared.js';

export const disableSubscriptionInputShape = {
  clientId: z.number().int().positive().describe('Client ID (from get_treatments)'),
  treatmentId: z.number().int().positive().describe('Treatment ID (from get_treatments)'),
  cancelOwner: z
    .string()
    .optional()
    .describe('Who initiated the cancellation (e.g. "admin", "doctor")'),
  cancelMotive: z.string().optional().describe('Cancellation motive category'),
  cancelReason: z.string().optional().describe('Specific cancellation reason'),
  cancelText: z.string().optional().describe('Free-text explanation'),
};

type Input = {
  clientId: number;
  treatmentId: number;
  cancelOwner?: string;
  cancelMotive?: string;
  cancelReason?: string;
  cancelText?: string;
};

export const disableSubscriptionTool = {
  name: 'disable_subscription',
  description:
    'Disable (deactivate) a treatment subscription. Calls choiz-core /clients/{id}/treatment/{tid}/subscription/disable. Side effects: follow-up status marked CHURN, last order marked as churn, chat conversation status updated. Cancellation fields are optional.',
  inputShape: disableSubscriptionInputShape,
  handler: async (input: Input): Promise<CallToolResult> => {
    const ctx = getContext();
    const jwt = await getJwt();
    try {
      const cancellation: CancellationRequest | undefined =
        input.cancelOwner || input.cancelMotive || input.cancelReason || input.cancelText
          ? {
              cancelOwner: input.cancelOwner,
              cancelMotive: input.cancelMotive,
              cancelReason: input.cancelReason,
              cancelText: input.cancelText,
            }
          : undefined;

      await ctx.choizCore.disableSubscription(
        input.clientId,
        input.treatmentId,
        cancellation,
        jwt,
      );

      return toolResult(
        `Subscription disabled: clientId=${input.clientId} treatmentId=${input.treatmentId}. Follow-up status: CHURN.`,
      );
    } catch (err) {
      return handleError(err);
    }
  },
};
