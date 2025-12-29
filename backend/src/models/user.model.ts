export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  lastname?: string;
  avatar_url?: string;
  bio?: string;
  favorite_category?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreateDTO {
  email: string;
  password: string;
  name: string;
  lastname?: string;
}

export interface UserUpdateDTO {
  name?: string;
  lastname?: string;
  avatar_url?: string;
  bio?: string;
  favorite_category?: string;
}

export interface UserPublic {
  id: number;
  email: string;
  name: string;
  lastname?: string;
  avatar_url?: string;
  bio?: string;
  favorite_category?: string;
  created_at: Date;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserPublic;
  token: string;
}
