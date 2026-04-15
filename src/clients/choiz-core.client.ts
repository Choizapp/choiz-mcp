import type {
  CancellationRequest,
  ChangeEmailDTO,
  ChangeRefillRequest,
  ChangeRefillResult,
  OrderDTO,
} from '../types/api.js';
import { BaseClient, type ClientOptions } from './base-client.js';

export interface ChoizCoreClientOptions extends ClientOptions {
  checkoutApiKey: string;
}

export class ChoizCoreClient extends BaseClient {
  private readonly checkoutApiKey: string;

  constructor(opts: ChoizCoreClientOptions) {
    super(opts);
    this.checkoutApiKey = opts.checkoutApiKey;
  }

  async changeEmail(oldEmail: string, newEmail: string, jwt: string): Promise<void> {
    const body: ChangeEmailDTO = { email: newEmail, oldEmail };
    await this.request({
      method: 'PUT',
      path: '/clients/emails',
      body,
      jwt,
    });
  }

  async enableSubscription(clientId: number, treatmentId: number, jwt: string): Promise<void> {
    await this.request({
      method: 'PUT',
      path: `/clients/${clientId}/treatment/${treatmentId}/subscription/enable`,
      headers: { 'x-api-key-checkout': this.checkoutApiKey },
      jwt,
    });
  }

  async disableSubscription(
    clientId: number,
    treatmentId: number,
    cancellation: CancellationRequest | undefined,
    jwt: string,
  ): Promise<void> {
    await this.request({
      method: 'PUT',
      path: `/clients/${clientId}/treatment/${treatmentId}/subscription/disable`,
      body: cancellation,
      jwt,
    });
  }

  async listOrders(
    clientId: number,
    jwt: string,
    options?: { treatmentIds?: number[]; latest?: boolean },
  ): Promise<OrderDTO[]> {
    const query: Record<string, string | number | undefined> = {};
    if (options?.treatmentIds?.length) {
      query.treatment_id = options.treatmentIds.join(',');
    }
    if (options?.latest !== undefined) {
      query.latest = options.latest ? 'true' : 'false';
    }
    const result = await this.request<OrderDTO[] | null>({
      method: 'GET',
      path: `/clients/${clientId}/orders`,
      query,
      jwt,
    });
    return result ?? [];
  }

  async getOrder(orderId: number, jwt: string): Promise<OrderDTO> {
    return await this.request<OrderDTO>({
      method: 'GET',
      path: `/orders/${orderId}`,
      jwt,
    });
  }

  async changeRefill(body: ChangeRefillRequest, jwt: string): Promise<ChangeRefillResult> {
    const result = await this.request<ChangeRefillResult | null>({
      method: 'PUT',
      path: '/clients/refill',
      body,
      jwt,
    });
    return result ?? {};
  }
}
