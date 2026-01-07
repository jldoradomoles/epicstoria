export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface User {
  id: number;
  email: string;
  name: string;
  lastname?: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  favorite_category?: string;
  created_at: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  lastname?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  lastname?: string;
  avatar_url?: string;
  bio?: string;
  favorite_category?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
