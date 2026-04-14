import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import type { CredentialDTO, CustomerDTO } from '../types/api.js';
import { getContext, getJwt } from './context.js';
import { handleError, toolError, toolResult } from './shared.js';

export const lookupAccountInputShape = {
  email: z.string().email().optional().describe('Account email address'),
  phone: z.string().optional().describe('Account phone number (with or without + prefix)'),
};

const inputSchema = z.object(lookupAccountInputShape);
type Input = z.infer<typeof inputSchema>;

export const lookupAccountTool = {
  name: 'lookup_account',
  description:
    'Look up a Choiz account by email OR phone. Returns credential info (id, roles, phone), customer profile (name, status), and derived status (pending, incomplete_profile, active). At least one of email or phone is required.',
  inputShape: lookupAccountInputShape,
  handler: async (input: Input): Promise<CallToolResult> => {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return toolError(`Invalid input: ${parsed.error.message}`);
    }

    if (!parsed.data.email && !parsed.data.phone) {
      return toolError('Either email or phone must be provided');
    }

    const ctx = getContext();
    const jwt = await getJwt();

    try {
      if (parsed.data.email) {
        const email = parsed.data.email;
        const [credential, customer] = await Promise.all([
          ctx.loginCore.getCredentialByEmail(email, jwt),
          ctx.myAccount.getCustomerByEmail(email, jwt).catch(() => null),
        ]);

        if (!credential && !customer) {
          return toolResult(`No account found for email: ${email}`);
        }

        return toolResult(formatAccountSummary(email, credential, customer));
      }

      // phone lookup
      const credentials = await ctx.loginCore.getCredentialsByPhone(parsed.data.phone!, jwt);

      if (credentials.length === 0) {
        return toolResult(`No accounts found for phone: ${parsed.data.phone}`);
      }

      const summaries = await Promise.all(
        credentials.map(async (cred) => {
          const customer = await ctx.myAccount
            .getCustomerByEmail(cred.name, jwt)
            .catch(() => null);
          return formatAccountSummary(cred.name, cred, customer);
        }),
      );

      return toolResult(summaries.join('\n\n---\n\n'));
    } catch (err) {
      return handleError(err);
    }
  },
};

function formatAccountSummary(
  email: string,
  credential: CredentialDTO | null,
  customer: CustomerDTO | null,
): string {
  const lines: string[] = [`Email: ${email}`];

  if (credential) {
    lines.push(`Credential ID: ${credential.id}`);
    if (credential.phone) lines.push(`Phone: ${credential.phone}`);
    if (credential.source) lines.push(`Source: ${credential.source}`);
    if (credential.isPasswordSet !== undefined) {
      lines.push(`Password set: ${credential.isPasswordSet}`);
    }
    if (credential.purchaseType) lines.push(`Purchase type: ${credential.purchaseType}`);
    const roleNames = (credential.roles ?? []).map((r) => r.name).join(', ');
    lines.push(`Roles: ${roleNames || '(none)'}`);
  } else {
    lines.push('Credential: NOT FOUND in login-core');
  }

  if (customer) {
    lines.push('');
    lines.push(`Customer name: ${customer.name ?? ''} ${customer.lastName ?? ''}`.trim());
    lines.push(`Customer status: ${customer.status ?? '(unknown)'}`);
    if (customer.treatments && customer.treatments.length > 0) {
      lines.push(`Treatments: ${customer.treatments.length}`);
      for (const t of customer.treatments) {
        const tid = t.treatmentId ?? t.id ?? '?';
        const name = t.treatmentName ?? '?';
        const sub = t.subscribed === true ? 'active' : t.subscribed === false ? 'inactive' : '?';
        lines.push(`  - treatmentId=${tid} name=${name} subscribed=${sub}`);
      }
    }
  } else {
    lines.push('');
    lines.push('Customer: NOT FOUND in my-account-core');
  }

  // Derived status
  const derived: string[] = [];
  if (credential?.isPasswordSet === false) derived.push('pending (no password set)');
  if (customer?.status === 'INVALID') derived.push('incomplete_profile');
  if (customer?.treatments?.some((t) => t.subscribed)) derived.push('has_active_subscription');
  if (customer?.treatments?.every((t) => !t.subscribed) && customer.treatments.length > 0) {
    derived.push('all_subscriptions_inactive');
  }
  if (derived.length > 0) {
    lines.push('');
    lines.push(`Derived status: ${derived.join(', ')}`);
  }

  return lines.join('\n');
}
