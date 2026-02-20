export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface User {
  id: number;
  email: string;
  name: string;
  lastname?: string;
  nickname?: string;
  birth_date?: string;
  country?: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  favorite_category?: string;
  points: number;
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
  nickname?: string;
  birth_date?: string;
  country?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  lastname?: string;
  nickname?: string;
  birth_date?: string;
  country?: string;
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

export interface QuizStatusResponse {
  can_take: boolean;
  last_completion: QuizCompletion | null;
  retry_available_at: Date | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Friend {
  id: number;
  name: string;
  lastname?: string;
  email: string;
  points: number;
  created_at: Date;
  isFriend?: boolean;
}

export interface FriendshipResponse {
  success: boolean;
  data: Friend[];
}

export interface AreFriendsResponse {
  success: boolean;
  data: {
    areFriends: boolean;
  };
}
