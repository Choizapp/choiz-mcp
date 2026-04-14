import type { CancellationRequest, ChangeEmailDTO } from '../types/api.js';
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
}
