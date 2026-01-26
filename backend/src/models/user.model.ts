export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  lastname?: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  favorite_category?: string;
  points: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreateDTO {
  email: string;
  password: string;
  name: string;
  lastname?: string;
  role?: UserRole;
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
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  favorite_category?: string;
  points: number;
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

export interface QuizCompletion {
  id: number;
  user_id: number;
  event_id: string;
  score: number;
  points_earned: number;
  completed_at: Date;
}

export interface PointsHistory {
  id: number;
  user_id: number;
  points: number;
  source: 'quiz' | 'game';
  source_id: string;
  created_at: Date;
}

export interface QuizCompletionRequest {
  event_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
}
