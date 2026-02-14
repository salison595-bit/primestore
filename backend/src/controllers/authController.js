/**
 * Controller de autenticação
 * Recebe requisições e delega para AuthService
 */

import AuthService from '../services/authService.js';
import prisma from '../config/database.js';
import { FormatterUtil } from '../utils/formatters.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('AuthController');

export class AuthController {
  /**
   * POST /api/auth/register
   * Registra novo usuário
   */
  static async register(req, res, next) {
    try {
      const { name, email, password, phone } = req.body;

      const result = await AuthService.register({
        name,
        email,
        password,
        phone
      });

      res.status(201).json(
        FormatterUtil.successResponse(result, 'Usuário registrado com sucesso')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Faz login do usuário
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login({
        email,
        password
      });

      // Retorna tokens em header também (segurança)
      res.set('X-Access-Token', result.accessToken);

      res.json(
        FormatterUtil.successResponse(result, 'Login realizado com sucesso')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh
   * Renova o access token
   */
  static async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;

      const result = await AuthService.refreshToken(refreshToken);

      res.json(
        FormatterUtil.successResponse(result, 'Token renovado com sucesso')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/verify
   * Verifica se um token é válido
   */
  static async verify(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          error: { message: 'Token não fornecido' }
        });
      }

      const decoded = await AuthService.verifyToken(token);

      res.json(
        FormatterUtil.successResponse(
          { valid: true, userId: decoded.id },
          'Token válido'
        )
      );
    } catch (error) {
      res.status(401).json(
        FormatterUtil.errorResponse('Token inválido', 'INVALID_TOKEN')
      );
    }
  }

  /**
   * POST /api/auth/forgot-password
   * Solicita recuperação de senha
   */
  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      const result = await AuthService.requestPasswordReset(email);

      res.json(
        FormatterUtil.successResponse(
          null,
          result.message
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/reset-password
   * Reseta a senha do usuário
   */
  static async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;

      const result = await AuthService.resetPassword({
        token,
        newPassword
      });

      res.json(
        FormatterUtil.successResponse(null, result.message)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/change-password
   * Altera a senha (requer autenticação)
   */
  static async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      const result = await AuthService.changePassword(userId, {
        currentPassword,
        newPassword
      });

      res.json(
        FormatterUtil.successResponse(null, result.message)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Faz logout do usuário
   */
  static async logout(req, res, next) {
    try {
      const userId = req.user?.id;

      const result = await AuthService.logout(userId);

      res.json(
        FormatterUtil.successResponse(null, result.message)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Retorna dados do usuário autenticado
   */
  static async getMe(req, res, next) {
    try {
      // req.user já vem do middleware de autenticação
      const userId = req.user.id;

      // Busca dados completos do usuário
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
          emailVerified: true,
          phoneVerified: true,
          createdAt: true,
          lastLogin: true,
          addresses: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'Usuário não encontrado' }
        });
      }

      res.json(
        FormatterUtil.successResponse(user, 'Dados do usuário')
      );
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
