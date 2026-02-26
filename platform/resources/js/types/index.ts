export type Role = 'admin' | 'gm' | 'store_manager' | 'key_lead' | 'staff';

export interface Organization {
  id: number;
  name: string;
  slug: string;
  timezone: string;
  status: string;
  role_labels: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
  organization: Organization;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  organization_name: string;
}
