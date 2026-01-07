import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import {
  AuthResponse,
  User,
  UserCreateDTO,
  UserPublic,
  UserRole,
  UserUpdateDTO,
} from '../models/user.model';

export class AuthService {
  private static toPublicUser(user: User): UserPublic {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      lastname: user.lastname,
      role: user.role,
      avatar_url: user.avatar_url,
      bio: user.bio,
      favorite_category: user.favorite_category,
      created_at: user.created_at,
    };
  }

  private static generateToken(userId: number, role: UserRole): string {
    const secret = process.env.JWT_SECRET || 'default_secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jwt.sign({ userId, role }, secret, { expiresIn } as jwt.SignOptions);
  }

  static async register(userData: UserCreateDTO): Promise<AuthResponse> {
    // Check if email already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [userData.email]);
    if (existingUser.rows.length > 0) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Insert user with default role 'user'
    const role = userData.role || UserRole.USER;
    const result = await query(
      `INSERT INTO users (email, password, name, lastname, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userData.email, hashedPassword, userData.name, userData.lastname || null, role],
    );

    const user = result.rows[0] as User;
    const token = this.generateToken(user.id, user.role);

    return {
      user: this.toPublicUser(user),
      token,
    };
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    // Find user
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      throw new AppError('Invalid email or password', 401);
    }

    const user = result.rows[0] as User;

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken(user.id, user.role);

    return {
      user: this.toPublicUser(user),
      token,
    };
  }

  static async getProfile(userId: number): Promise<UserPublic> {
    const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    return this.toPublicUser(result.rows[0] as User);
  }

  static async updateProfile(userId: number, updateData: UserUpdateDTO): Promise<UserPublic> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updateData.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(updateData.name);
    }
    if (updateData.lastname !== undefined) {
      fields.push(`lastname = $${paramIndex++}`);
      values.push(updateData.lastname);
    }
    if (updateData.avatar_url !== undefined) {
      fields.push(`avatar_url = $${paramIndex++}`);
      values.push(updateData.avatar_url);
    }
    if (updateData.bio !== undefined) {
      fields.push(`bio = $${paramIndex++}`);
      values.push(updateData.bio);
    }
    if (updateData.favorite_category !== undefined) {
      fields.push(`favorite_category = $${paramIndex++}`);
      values.push(updateData.favorite_category);
    }

    if (fields.length === 0) {
      throw new AppError('No fields to update', 400);
    }

    values.push(userId);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    return this.toPublicUser(result.rows[0] as User);
  }

  static async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    // Get current user
    const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    const user = result.rows[0] as User;

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);
  }
}
