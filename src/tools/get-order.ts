import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { getContext, getJwt } from './context.js';
import { handleError, toolResult } from './shared.js';

export const getOrderInputShape = {
  orderId: z.number().int().positive().describe('Order ID (from list_orders)'),
};

type Input = { orderId: number };

export const getOrderTool = {
  name: 'get_order',
  description:
    'Get full details of a single order by ID, including status, delivery address, tracking URL, carrier, and products. Calls choiz-core /orders/{orderId}.',
  inputShape: getOrderInputShape,
  handler: async (input: Input): Promise<CallToolResult> => {
    const ctx = getContext();
    const jwt = await getJwt();
    try {
      const o = await ctx.choizCore.getOrder(input.orderId, jwt);

      const lines: string[] = [`Order ${o.id}`];
      lines.push(`Status: ${o.statusEs ?? o.status ?? '?'} (id=${o.statusId ?? '?'})`);
      if (o.substate) lines.push(`Substate: ${o.substate} (id=${o.substateId ?? '?'})`);
      if (o.treatment) {
        lines.push(`Treatment: ${o.treatment.name ?? '?'} (id=${o.treatment.id ?? '?'})`);
      }
      if (o.client) {
        lines.push(`Client: ${o.client.email ?? '?'} (id=${o.client.id ?? '?'})`);
      }
      if (o.deliveryDate) lines.push(`Delivery date: ${o.deliveryDate}`);
      const addressParts = [o.street, o.streetNumber, o.city, o.province, o.zipCode].filter(
        Boolean,
      );
      if (addressParts.length) lines.push(`Address: ${addressParts.join(', ')}`);
      if (o.trackingId) lines.push(`Tracking ID: ${o.trackingId}`);
      if (o.trackingUrl) lines.push(`Tracking URL: ${o.trackingUrl}`);
      if (o.carrier) lines.push(`Carrier: ${o.carrier}`);
      if (o.shippingCost !== undefined) lines.push(`Shipping cost: ${o.shippingCost}`);
      if (o.recurrent !== undefined) lines.push(`Recurrent: ${o.recurrent}`);
      if (o.created) lines.push(`Created: ${o.created}`);

      return toolResult(lines.join('\n'));
    } catch (err) {
      return handleError(err);
    }
  },
};
