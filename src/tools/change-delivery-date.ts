import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import type { ChangeRefillRequest } from '../types/api.js';
import { getContext, getJwt } from './context.js';
import { handleError, toolResult } from './shared.js';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const dateSchema = z
  .string()
  .regex(dateRegex, 'Date must be in yyyy-MM-dd format');

export const changeDeliveryDateInputShape = {
  from: dateSchema.describe('Current delivery window start (yyyy-MM-dd)'),
  to: dateSchema.describe('Current delivery window end (yyyy-MM-dd)'),
  nextDeliveryDate: dateSchema.describe('New next delivery date (yyyy-MM-dd)'),
  clientIdList: z
    .array(z.number().int().positive())
    .optional()
    .describe('Optional list of client IDs to scope the change'),
  treatmentId: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Optional treatment ID to scope the change'),
};

type Input = {
  from: string;
  to: string;
  nextDeliveryDate: string;
  clientIdList?: number[];
  treatmentId?: number;
};

export const changeDeliveryDateTool = {
  name: 'change_delivery_date',
  description:
    'Change the next delivery (refill) date for clients in a date window. Calls choiz-core /clients/refill. Useful to postpone or advance scheduled deliveries.',
  inputShape: changeDeliveryDateInputShape,
  handler: async (input: Input): Promise<CallToolResult> => {
    const ctx = getContext();
    const jwt = await getJwt();
    try {
      const body: ChangeRefillRequest = {
        from: input.from,
        to: input.to,
        nextDeliveryDate: input.nextDeliveryDate,
        clientIdList: input.clientIdList ?? [],
        treatmentId: input.treatmentId,
      };
      const result = await ctx.choizCore.changeRefill(body, jwt);
      return toolResult(
        `Delivery date updated. Window ${input.from} → ${input.to} rescheduled to ${input.nextDeliveryDate}.\nResult: ${JSON.stringify(result, null, 2)}`,
      );
    } catch (err) {
      return handleError(err);
    }
  },
};
