// core/models/user.ts

export type UserRole = 'doctor' | 'patient' | 'receptionist';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  gender?: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

// 👇 Add this — covers common .NET response variations
export interface RawLoginResponse {
  // Token field variations
  token?: string;
  accessToken?: string;

  // Refresh token variations
  refreshToken?: string;
  refresh_token?: string;

  // User as a nested object (your current model)
  user?: {
    id?: string | number;
    userId?: string | number;
    name?: string;
    fullName?: string;
    userName?: string;
    email?: string;
    role?: UserRole;
  };

  // User fields flattened at the root level (very common in .NET)
  userId?: string | number;
  id?: string | number;
  name?: string;
  fullName?: string;
  userName?: string;
  email?: string;
  role?: UserRole;
}

export interface RegisterResponse {
  message?: string;
}
