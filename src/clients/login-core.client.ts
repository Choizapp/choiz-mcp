import { ApiError } from '../errors/api-error.js';
import type {
  CredentialDTO,
  MergeAccountRequest,
  ResetPasswordByAdminRequest,
} from '../types/api.js';
import { BaseClient } from './base-client.js';

export class LoginCoreClient extends BaseClient {
  async getCredentialByEmail(email: string, jwt: string): Promise<CredentialDTO | null> {
    try {
      return await this.request<CredentialDTO>({
        method: 'GET',
        path: '/login/credentials/credential',
        headers: { name: email },
        jwt,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        return null;
      }
      throw err;
    }
  }

  async getCredentialsByPhone(phone: string, jwt: string): Promise<CredentialDTO[]> {
    const result = await this.request<CredentialDTO[] | null>({
      method: 'GET',
      path: '/login/admin/credentials',
      query: { phone },
      jwt,
    });
    return result ?? [];
  }

  async resetPasswordAsAdmin(userName: string, password: string, jwt: string): Promise<void> {
    const body: ResetPasswordByAdminRequest = { userName, password };
    await this.request({
      method: 'PUT',
      path: '/login/admin/credentials/reset-password',
      body,
      jwt,
    });
  }

  async mergeAccounts(body: MergeAccountRequest, jwt: string): Promise<void> {
    await this.request({
      method: 'POST',
      path: '/login/admin/credentials/merge',
      body,
      jwt,
    });
  }
}
