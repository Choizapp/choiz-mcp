// Login-core-mx DTOs

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface RoleDTO {
  id?: number;
  name: string;
  description?: string;
}

export interface JwtResponse {
  accessToken: string;
  tokenType?: string;
  username: string;
  roles: Array<RoleDTO | string>;
  source?: string;
  refreshToken?: string;
  isPasswordSet?: boolean;
  purchaseType?: string;
}

export interface CredentialDTO {
  id: number;
  name: string;
  roles: RoleDTO[];
  phone?: string;
  createdOn?: string;
  purchaseType?: string;
  isPasswordSet?: boolean;
  source?: string;
}

export interface ResetPasswordByAdminRequest {
  userName: string;
  password: string;
}

// Choiz-core-mx DTOs
export interface ChangeEmailDTO {
  email: string; // new email
  oldEmail: string; // old email (required for admins)
}

export interface CancellationRequest {
  cancelOwner?: string;
  cancelMotive?: string;
  cancelReason?: string;
  cancelText?: string;
}

// My-account-core-mx DTOs
export interface CustomerTreatmentDTO {
  id?: number;
  clientId?: number;
  treatmentId?: number;
  treatmentName?: string;
  subscribed?: boolean;
  [key: string]: unknown;
}

export interface CustomerDTO {
  id?: number;
  name?: string;
  lastName?: string;
  email?: string;
  telephone?: string;
  birthday?: string;
  birthSex?: string;
  status?: 'INVALID' | 'COMPLETED';
  treatments?: CustomerTreatmentDTO[];
  [key: string]: unknown;
}

// Order DTOs (choiz-core)
export interface OrderDTO {
  id?: number;
  statusId?: number;
  status?: string;
  statusEs?: string;
  substateId?: number;
  substate?: string;
  comboId?: number;
  treatment?: { id?: number; name?: string; [key: string]: unknown };
  client?: { id?: number; email?: string; name?: string; [key: string]: unknown };
  deliveryDate?: string;
  street?: string;
  streetNumber?: string;
  city?: string;
  province?: string;
  zipCode?: string;
  trackingUrl?: string;
  trackingId?: string;
  carrier?: string;
  shippingCost?: number;
  recurrent?: boolean;
  created?: string;
  modified?: string;
  [key: string]: unknown;
}

export interface ChangeRefillRequest {
  from: string; // yyyy-MM-dd
  to: string; // yyyy-MM-dd
  nextDeliveryDate: string; // yyyy-MM-dd
  clientIdList?: number[];
  treatmentId?: number;
}

export interface ChangeRefillResult {
  [key: string]: unknown;
}

// Merge accounts (login-core direct)
export interface MergeAccountRequest {
  userName: string; // email
  phone: string;
}

// Generic response
export interface MessageResponse {
  message: string;
  data?: string;
}

// JWT decoded claims (login-core JWT format)
export interface JwtClaims {
  sub: string; // username
  CLAIM_TOKEN: string; // comma-separated authorities (e.g., "ROLE_ADMIN,ROLE_USER")
  iss: string;
  iat: number;
  exp: number;
}
