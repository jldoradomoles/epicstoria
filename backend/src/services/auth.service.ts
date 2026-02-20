import bcrypt from 'bcryptjs';
import crypto from 'crypto';
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
import { EmailService } from './email.service';

export class AuthService {
  private static toPublicUser(user: User): UserPublic {
    // Convertir birth_date a formato YYYY-MM-DD string si existe
    // Como usamos ::TEXT en las queries, birth_date siempre vendrá como string
    let birthDateStr: string | undefined = undefined;
    if (user.birth_date) {
      // Tomar solo la parte de fecha en caso de que tenga timestamp
      birthDateStr = String(user.birth_date).split('T')[0];
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      lastname: user.lastname,
      nickname: user.nickname,
      birth_date: birthDateStr,
      country: user.country,
      role: user.role,
      avatar_url: user.avatar_url,
      bio: user.bio,
      favorite_category: user.favorite_category,
      points: user.points || 0,
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
      `INSERT INTO users (email, password, name, lastname, nickname, birth_date, country, role)
       VALUES ($1, $2, $3, $4, $5, $6::DATE, $7, $8)
       RETURNING id, email, password, name, lastname, nickname, birth_date::TEXT, country, role, avatar_url, bio, favorite_category, points, created_at, updated_at`,
      [
        userData.email,
        hashedPassword,
        userData.name,
        userData.lastname || null,
        userData.nickname || null,
        userData.birth_date || null,
        userData.country || null,
        role,
      ],
    );

    const user = result.rows[0] as User;
    const token = this.generateToken(user.id, user.role);

    // Enviar email de bienvenida (no bloqueante)
    EmailService.sendWelcomeEmail(user.email, user.name).catch((error) => {
      console.error('Error enviando email de bienvenida:', error);
      // No lanzamos error para no bloquear el registro
    });

    return {
      user: this.toPublicUser(user),
      token,
    };
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    // Find user
    const result = await query(
      'SELECT id, email, password, name, lastname, nickname, birth_date::TEXT, country, role, avatar_url, bio, favorite_category, points, created_at, updated_at FROM users WHERE email = $1',
      [email],
    );
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
    const result = await query(
      'SELECT id, email, password, name, lastname, nickname, birth_date::TEXT, country, role, avatar_url, bio, favorite_category, points, created_at, updated_at FROM users WHERE id = $1',
      [userId],
    );
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
    if (updateData.nickname !== undefined) {
      fields.push(`nickname = $${paramIndex++}`);
      values.push(updateData.nickname);
    }
    if (updateData.birth_date !== undefined) {
      // Usar CAST a DATE para evitar problemas de timezone
      fields.push(`birth_date = $${paramIndex++}::DATE`);
      values.push(updateData.birth_date);
    }
    if (updateData.country !== undefined) {
      fields.push(`country = $${paramIndex++}`);
      values.push(updateData.country);
    }

    if (fields.length === 0) {
      throw new AppError('No fields to update', 400);
    }

    values.push(userId);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, password, name, lastname, nickname, birth_date::TEXT, country, role, avatar_url, bio, favorite_category, points, created_at, updated_at`,
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
    const result = await query(
      'SELECT id, email, password, name, lastname, nickname, birth_date::TEXT, country, role, avatar_url, bio, favorite_category, points, created_at, updated_at FROM users WHERE id = $1',
      [userId],
    );
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

  /**
   * Solicita un reset de contraseña generando un token y enviando email
   */
  static async requestPasswordReset(email: string): Promise<void> {
    // Buscar usuario por email
    const result = await query(
      'SELECT id, email, password, name, lastname, nickname, birth_date::TEXT, country, role, avatar_url, bio, favorite_category, points, reset_token, reset_token_expiry, created_at, updated_at FROM users WHERE email = $1',
      [email],
    );

    if (result.rows.length === 0) {
      // Por seguridad, no revelamos si el email existe o no
      // Retornamos éxito pero no hacemos nada
      return;
    }

    const user = result.rows[0] as User;

    // Generar token aleatorio seguro
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash del token para almacenarlo de forma segura
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Token válido por 1 hora
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    // Guardar token en base de datos
    await query('UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3', [
      hashedToken,
      expiryDate,
      user.id,
    ]);

    // Enviar email con el token (sin hashear)
    try {
      await EmailService.sendPasswordResetEmail(user.email, user.name, resetToken);
    } catch (error) {
      console.error('Error enviando email de reset:', error);
      // Limpiar el token si falla el envío del email
      await query('UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE id = $1', [
        user.id,
      ]);
      throw new AppError('Failed to send password reset email', 500);
    }
  }

  /**
   * Resetea la contraseña usando el token recibido por email
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    // Hash del token recibido para comparar con el almacenado
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Buscar usuario con el token válido
    const result = await query(
      `SELECT id, email, password, name, lastname, nickname, birth_date::TEXT, country, role, avatar_url, bio, favorite_category, points, reset_token, reset_token_expiry, created_at, updated_at FROM users
       WHERE reset_token = $1
       AND reset_token_expiry > NOW()`,
      [hashedToken],
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const user = result.rows[0] as User;

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Actualizar contraseña y limpiar token
    await query(
      `UPDATE users
       SET password = $1,
           reset_token = NULL,
           reset_token_expiry = NULL
       WHERE id = $2`,
      [hashedPassword, user.id],
    );

    // Enviar email de confirmación
    try {
      await EmailService.sendPasswordChangedConfirmation(user.email, user.name);
    } catch (error) {
      console.error('Error enviando email de confirmación:', error);
      // No lanzamos error porque la contraseña ya fue cambiada exitosamente
    }
  }
}
