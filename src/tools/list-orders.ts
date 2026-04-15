import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import type { OrderDTO } from '../types/api.js';
import { getContext, getJwt } from './context.js';
import { handleError, toolResult } from './shared.js';

export const listOrdersInputShape = {
  clientId: z.number().int().positive().describe('Client ID (from lookup_account or get_treatments)'),
  treatmentIds: z
    .array(z.number().int().positive())
    .optional()
    .describe('Filter by specific treatment IDs'),
  latest: z
    .boolean()
    .optional()
    .describe('Return only the latest order per treatment (default: true)'),
};

type Input = { clientId: number; treatmentIds?: number[]; latest?: boolean };

export const listOrdersTool = {
  name: 'list_orders',
  description:
    'List orders for a client. Calls choiz-core /clients/{clientId}/orders. Returns order status, treatment, delivery info, and tracking data.',
  inputShape: listOrdersInputShape,
  handler: async (input: Input): Promise<CallToolResult> => {
    const ctx = getContext();
    const jwt = await getJwt();
    try {
      const orders = await ctx.choizCore.listOrders(input.clientId, jwt, {
        treatmentIds: input.treatmentIds,
        latest: input.latest,
      });

      if (orders.length === 0) {
        return toolResult(`No orders found for clientId=${input.clientId}`);
      }

      const lines = [`Orders for clientId=${input.clientId} (${orders.length}):`];
      for (const o of orders) {
        lines.push(formatOrderSummary(o));
      }
      return toolResult(lines.join('\n'));
    } catch (err) {
      return handleError(err);
    }
  },
};

function formatOrderSummary(o: OrderDTO): string {
  const parts = [
    `  - orderId=${o.id ?? '?'}`,
    `status=${o.statusEs ?? o.status ?? '?'}`,
    `treatment=${o.treatment?.name ?? o.treatment?.id ?? '?'}`,
  ];
  if (o.deliveryDate) parts.push(`delivery=${o.deliveryDate}`);
  if (o.trackingId) parts.push(`tracking=${o.trackingId}`);
  return parts.join(' ');
}
