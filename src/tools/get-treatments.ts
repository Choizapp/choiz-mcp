import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { getContext, getJwt } from './context.js';
import { handleError, toolResult } from './shared.js';

export const getTreatmentsInputShape = {
  email: z.string().email().describe('Account email address'),
};

type Input = { email: string };

export const getTreatmentsTool = {
  name: 'get_treatments',
  description:
    'Get all treatments and subscription state for an account by email. Returns clientId, treatmentId, treatmentName, and subscribed flag for each treatment. Use this before enable_subscription or disable_subscription to obtain the required IDs.',
  inputShape: getTreatmentsInputShape,
  handler: async (input: Input): Promise<CallToolResult> => {
    const ctx = getContext();
    const jwt = await getJwt();
    try {
      const treatments = await ctx.myAccount.getTreatmentsByEmail(input.email, jwt);

      if (treatments.length === 0) {
        return toolResult(`No treatments found for ${input.email}`);
      }

      const lines = [`Treatments for ${input.email}:`];
      for (const t of treatments) {
        const clientId = t.clientId ?? '?';
        const treatmentId = t.treatmentId ?? t.id ?? '?';
        const name = t.treatmentName ?? '?';
        const sub = t.subscribed === true ? 'active' : t.subscribed === false ? 'inactive' : '?';
        lines.push(
          `  - clientId=${clientId} treatmentId=${treatmentId} name=${name} subscribed=${sub}`,
        );
      }

      return toolResult(lines.join('\n'));
    } catch (err) {
      return handleError(err);
    }
  },
};
