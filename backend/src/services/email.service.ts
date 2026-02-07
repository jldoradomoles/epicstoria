import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export class EmailService {
  private static transporter: Transporter;

  /**
   * Inicializa el transportador de email con la configuración
   */
  private static getTransporter(): Transporter {
    if (!this.transporter) {
      const config: EmailConfig = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true', // true para 465, false para otros puertos
        auth: {
          user: process.env.EMAIL_USER || '',
          pass: process.env.EMAIL_PASSWORD || '',
        },
      };

      this.transporter = nodemailer.createTransport(config);
    }

    return this.transporter;
  }

  /**
   * Envía un email genérico
   */
  private static async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const transporter = this.getTransporter();

    try {
      const info = await transporter.sendMail({
        from: `"Epicstoria" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });

      console.log('📧 Email enviado:', info.messageId);
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Envía un email de bienvenida al registrarse un nuevo usuario
   */
  static async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const subject = '¡Bienvenido a Epicstoria! 🎉';
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #d97706;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .button:hover {
            background: #b45309;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>¡Bienvenido a Epicstoria!</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${name}</strong>,</p>

          <p>¡Gracias por unirte a Epicstoria! Estamos emocionados de tenerte en nuestra comunidad de amantes de la historia.</p>

          <p>Con Epicstoria podrás:</p>
          <ul>
            <li>📚 Explorar eventos históricos fascinantes</li>
            <li>🎯 Responder quizzes y ganar puntos</li>
            <li>👥 Conectar con otros entusiastas de la historia</li>
            <li>💬 Compartir conocimientos y debatir</li>
          </ul>

          <p>¡Empieza tu viaje por la historia ahora!</p>

          <a href="${process.env.FRONTEND_URL || 'http://localhost:4200'}" class="button">
            Explorar Epicstoria
          </a>

          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>

          <p>¡Feliz aprendizaje!</p>
          <p><strong>El equipo de Epicstoria</strong></p>
        </div>
        <div class="footer">
          <p>Este es un mensaje automático, por favor no respondas a este email.</p>
          <p>&copy; ${new Date().getFullYear()} Epicstoria. Todos los derechos reservados.</p>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(email, subject, html);
  }

  /**
   * Envía un email para resetear la contraseña
   */
  static async sendPasswordResetEmail(
    email: string,
    name: string,
    resetToken: string,
  ): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/restablecer-password?token=${resetToken}`;
    const subject = 'Restablece tu contraseña - Epicstoria';

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #d97706;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .button:hover {
            background: #b45309;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 20px;
          }
          .token-box {
            background: #fff;
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 5px;
            font-family: monospace;
            word-break: break-all;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔐 Restablece tu contraseña</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${name}</strong>,</p>

          <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Epicstoria.</p>

          <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>

          <a href="${resetUrl}" class="button">
            Restablecer contraseña
          </a>

          <p>O copia y pega este enlace en tu navegador:</p>
          <div class="token-box">
            ${resetUrl}
          </div>

          <div class="warning">
            <strong>⚠️ Importante:</strong>
            <ul>
              <li>Este enlace es válido por <strong>1 hora</strong></li>
              <li>Si no solicitaste este cambio, ignora este email</li>
              <li>Tu contraseña actual seguirá siendo válida hasta que la cambies</li>
            </ul>
          </div>

          <p>Si tienes problemas con el enlace, contacta con nuestro soporte.</p>

          <p>Saludos,</p>
          <p><strong>El equipo de Epicstoria</strong></p>
        </div>
        <div class="footer">
          <p>Este es un mensaje automático, por favor no respondas a este email.</p>
          <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este mensaje.</p>
          <p>&copy; ${new Date().getFullYear()} Epicstoria. Todos los derechos reservados.</p>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(email, subject, html);
  }

  /**
   * Envía una confirmación de que la contraseña fue cambiada exitosamente
   */
  static async sendPasswordChangedConfirmation(email: string, name: string): Promise<void> {
    const subject = 'Tu contraseña ha sido actualizada - Epicstoria';
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .success {
            background: #d4edda;
            border-left: 4px solid #28a745;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✅ Contraseña actualizada</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${name}</strong>,</p>

          <div class="success">
            <p><strong>✓ Tu contraseña ha sido actualizada exitosamente</strong></p>
            <p>Fecha: ${new Date().toLocaleString('es-ES')}</p>
          </div>

          <p>Tu contraseña de Epicstoria ha sido cambiada. Ya puedes iniciar sesión con tu nueva contraseña.</p>

          <p><strong>¿No fuiste tú?</strong></p>
          <p>Si no realizaste este cambio, contacta inmediatamente con nuestro equipo de soporte para proteger tu cuenta.</p>

          <p>Saludos,</p>
          <p><strong>El equipo de Epicstoria</strong></p>
        </div>
        <div class="footer">
          <p>Este es un mensaje automático, por favor no respondas a este email.</p>
          <p>&copy; ${new Date().getFullYear()} Epicstoria. Todos los derechos reservados.</p>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(email, subject, html);
  }

  /**
   * Verifica que la configuración de email esté correcta
   */
  static async verifyConnection(): Promise<boolean> {
    const transporter = this.getTransporter();

    try {
      await transporter.verify();
      console.log('✅ Conexión con servidor de email verificada');
      return true;
    } catch (error) {
      console.error('❌ Error verificando conexión con servidor de email:', error);
      return false;
    }
  }
}
