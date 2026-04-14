import { ApiError } from '../errors/api-error.js';
import type { CustomerDTO, CustomerTreatmentDTO } from '../types/api.js';
import { BaseClient } from './base-client.js';

export class MyAccountCoreClient extends BaseClient {
  async getCustomerByEmail(email: string, jwt: string): Promise<CustomerDTO | null> {
    try {
      return await this.request<CustomerDTO>({
        method: 'GET',
        path: '/customers/customer_more_treatments',
        headers: { email },
        jwt,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        return null;
      }
      throw err;
    }
  }

  async getTreatmentsByEmail(email: string, jwt: string): Promise<CustomerTreatmentDTO[]> {
    const result = await this.request<CustomerTreatmentDTO[] | null>({
      method: 'GET',
      path: '/customers/customer/treatments/email',
      headers: { email },
      jwt,
    });
    return result ?? [];
  }
}
