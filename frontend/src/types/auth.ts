export type Role = 'CUSTOMER' | 'SUPPORT_AGENT' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
