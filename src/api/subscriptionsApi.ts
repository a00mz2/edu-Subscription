import api from './client';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminLoginResponse {
  token: string;
  userName: string;
  fullName: string;
  expiresAt: string;
}

export interface SubscriptionTypeDto {
  subscriptionTypeId: number;
  subscriptionTypeName: string;
  durationDays: number;
  price: number;
  description: string;
  isTrial: boolean;
  isActive: boolean;
}

export interface SaveSubscriptionTypeRequest {
  subscriptionTypeName: string;
  durationDays: number;
  price: number;
  description: string;
  isTrial: boolean;
  isActive: boolean;
}

export interface SubscriptionAccountDto {
  subscriptionAccountId: number;
  subscriberName: string;
  address: string;
  phone: string;
  isActive: boolean;
  isArchive: boolean;
  createdAt: string;
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUsername: string;
  dbConfigured: boolean;
  accessToken: string;
  programUrl: string;
  enabledModules: string[];
  currentSubscriptionId: number | null;
  currentSubscriptionTypeName: string | null;
  currentEndDate: string | null;
  isSubscriptionActive: boolean;
  isSubscriptionSuspended: boolean;
  remainingDays: number;
  subscriptionStatus: string;
  usersCount: number;
}

export interface AccountsSummaryDto {
  total: number;
  active: number;
  expired: number;
  suspended: number;
  none: number;
}

export interface CreateSubscriptionAccountRequest {
  subscriberName: string;
  address: string;
  phone: string;
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUsername: string;
  dbPassword: string;
  programUrl: string;
  enabledModules: string[];
  isActive: boolean;
}

export interface UpdateSubscriptionAccountRequest {
  subscriberName: string;
  address: string;
  phone: string;
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUsername: string;
  dbPassword?: string;
  programUrl: string;
  enabledModules: string[];
  isActive: boolean;
}

export interface ModuleItemDto { key: string; label: string; }
export interface ModuleGroupDto { group: string; groupLabel: string; items: ModuleItemDto[]; }

export interface SubscriptionDto {
  subscriptionId: number;
  subscriptionAccountId: number;
  subscriberName: string;
  subscriptionTypeId: number;
  subscriptionTypeName: string;
  startDate: string;
  endDate: string;
  amount: number;
  isTrial: boolean;
  isActive: boolean;
  isExpired: boolean;
  remainingDays: number;
  createdAt: string;
  status: string;
}

export interface ClientRoleDto {
  roleId: number;
  roleName: string;
}

export interface SubscriptionUserDto {
  subscriptionUserId: number;
  subscriptionAccountId: number;
  subscriberName: string;
  userName: string;
  fullName: string;
  isSuperAdmin: boolean;
  isActive: boolean;
  clientUserId: number;
  clientRoleId: number;
  createdAt: string;
}

export interface CreateSubscriptionUserRequest {
  subscriptionAccountId: number;
  userName: string;
  password: string;
  fullName: string;
  clientRoleId: number;
  isSuperAdmin: boolean;
  isActive: boolean;
}

export interface UpdateSubscriptionUserRequest {
  userName: string;
  password?: string;
  fullName: string;
  clientRoleId: number;
  isSuperAdmin: boolean;
  isActive: boolean;
}

// ─── Admin auth ───────────────────────────────────────────────────────────────

export const adminLogin = async (userName: string, password: string): Promise<AdminLoginResponse> => {
  const { data } = await api.post('/adminauth/login', { userName, password });
  return data.data;
};

// ─── Subscription Types ───────────────────────────────────────────────────────

export const getSubscriptionTypes = async (activeOnly = false): Promise<SubscriptionTypeDto[]> => {
  const { data } = await api.get('/subscriptiontypes', { params: { activeOnly } });
  return data.data ?? [];
};

export const createSubscriptionType = async (req: SaveSubscriptionTypeRequest): Promise<number> => {
  const { data } = await api.post('/subscriptiontypes', req);
  return data.data;
};

export const updateSubscriptionType = async (id: number, req: SaveSubscriptionTypeRequest): Promise<void> => {
  await api.put(`/subscriptiontypes/${id}`, req);
};

export const deleteSubscriptionType = async (id: number): Promise<void> => {
  await api.delete(`/subscriptiontypes/${id}`);
};

// ─── Subscription Accounts ────────────────────────────────────────────────────

export const getSubscriptionAccounts = async (
  page = 1, pageSize = 20, search = '', status = '',
): Promise<PagedResult<SubscriptionAccountDto>> => {
  const { data } = await api.get('/subscriptionaccounts', {
    params: { page, pageSize, search: search || undefined, status: status || undefined },
  });
  return data.data;
};

export const getAccountsSummary = async (): Promise<AccountsSummaryDto> => {
  const { data } = await api.get('/subscriptionaccounts/summary');
  return data.data;
};

export const createSubscriptionAccount = async (req: CreateSubscriptionAccountRequest): Promise<number> => {
  const { data } = await api.post('/subscriptionaccounts', req);
  return data.data;
};

export const updateSubscriptionAccount = async (id: number, req: UpdateSubscriptionAccountRequest): Promise<void> => {
  await api.put(`/subscriptionaccounts/${id}`, req);
};

export const deleteSubscriptionAccount = async (id: number): Promise<void> => {
  await api.delete(`/subscriptionaccounts/${id}`);
};

export const testClientConnection = async (id: number): Promise<string> => {
  const { data } = await api.get(`/subscriptionaccounts/${id}/test-connection`);
  return data.message;
};

export const regenerateAccessToken = async (id: number): Promise<string> => {
  const { data } = await api.post(`/subscriptionaccounts/${id}/regenerate-token`);
  return data.data;
};

/// أصل خادم نظام الاشتراكات (بدون /api) لبناء رابط الدخول العام
const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5096/api').replace(/\/api\/?$/, '');
export const buildAccessUrl = (token: string): string => `${API_ORIGIN}/go/${token}`;

export const getClientRoles = async (accountId: number): Promise<ClientRoleDto[]> => {
  const { data } = await api.get(`/subscriptionusers/account/${accountId}/client-roles`);
  return data.data ?? [];
};

// ─── Modules catalog ──────────────────────────────────────────────────────────

export const getModulesCatalog = async (): Promise<ModuleGroupDto[]> => {
  const { data } = await api.get('/modules');
  return data.data ?? [];
};

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const getAccountSubscriptions = async (accountId: number): Promise<SubscriptionDto[]> => {
  const { data } = await api.get(`/subscriptions/account/${accountId}`);
  return data.data ?? [];
};

export const createSubscription = async (req: { subscriptionAccountId: number; subscriptionTypeId: number }): Promise<number> => {
  const { data } = await api.post('/subscriptions', req);
  return data.data;
};

export const renewSubscription = async (accountId: number, req: { subscriptionTypeId: number }): Promise<number> => {
  const { data } = await api.post(`/subscriptions/account/${accountId}/renew`, req);
  return data.data;
};

export const deleteSubscription = async (id: number): Promise<void> => {
  await api.delete(`/subscriptions/${id}`);
};

export const suspendSubscription = async (accountId: number): Promise<void> => {
  await api.post(`/subscriptions/account/${accountId}/suspend`);
};

export const resumeSubscription = async (accountId: number): Promise<void> => {
  await api.post(`/subscriptions/account/${accountId}/resume`);
};

export const runExpiryCheck = async (): Promise<number> => {
  const { data } = await api.post('/subscriptions/run-expiry-check');
  return data.data;
};

// ─── Subscription Users ───────────────────────────────────────────────────────

export const getAccountUsers = async (accountId: number): Promise<SubscriptionUserDto[]> => {
  const { data } = await api.get(`/subscriptionusers/account/${accountId}`);
  return data.data ?? [];
};

export const createSubscriptionUser = async (req: CreateSubscriptionUserRequest): Promise<number> => {
  const { data } = await api.post('/subscriptionusers', req);
  return data.data;
};

export const updateSubscriptionUser = async (id: number, req: UpdateSubscriptionUserRequest): Promise<void> => {
  await api.put(`/subscriptionusers/${id}`, req);
};

export const deleteSubscriptionUser = async (id: number): Promise<void> => {
  await api.delete(`/subscriptionusers/${id}`);
};
