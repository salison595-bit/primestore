/**
 * Service de autenticação
 * Lógica de negócio para login, registro, refresh tokens
 */

import prisma from '../config/database.js';
import JWTUtil from '../utils/jwt.js';
import PasswordUtil from '../utils/password.js';
import { createLogger } from '../utils/logger.js';
import {
  AuthenticationError,
  ValidationError,
  AlreadyExistsError,
  NotFoundError
} from '../utils/errors.js';

const logger = createLogger('AuthService');

export class AuthService {
  /**
   * Registra um novo usuário
   * @param {Object} data - { name, email, password, phone }
   * @returns {Promise<Object>} - { user, accessToken, refreshToken }
   */
  static async register(data) {
    const { name, email, password, phone } = data;

    // Validações
    if (!name || !email || !password) {
      throw new ValidationError('Nome, email e senha são obrigatórios');
    }

    // Verifica se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AlreadyExistsError('Usuário', 'Este email já está registrado');
    }

    // Hash da senha
    const hashedPassword = await PasswordUtil.hashPassword(password);

    try {
      // Cria usuário
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone: phone || null
        }
      });

      logger.info('Novo usuário registrado', { userId: user.id, email });

      // Gera tokens
      const tokens = JWTUtil.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role
      });

      // Remove password da resposta
      const { password: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };
    } catch (error) {
      logger.error('Erro ao registrar usuário', error);
      throw error;
    }
  }

  /**
   * Faz login de um usuário
   * @param {Object} data - { email, password }
   * @returns {Promise<Object>} - { user, accessToken, refreshToken }
   */
  static async login(data) {
    const { email, password } = data;

    if (!email || !password) {
      throw new ValidationError('Email e senha são obrigatórios');
    }

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      logger.warn('Tentativa de login com usuário não existente', { email });
      throw new AuthenticationError('Email ou senha inválidos');
    }

    // Verifica se usuário está ativo
    if (!user.isActive) {
      logger.warn('Tentativa de login com usuário inativo', { userId: user.id });
      throw new AuthenticationError('Conta desativada. Contate o suporte');
    }

    // Verifica senha
    const passwordValid = await PasswordUtil.comparePassword(password, user.password);

    if (!passwordValid) {
      logger.warn('Tentativa de login com senha incorreta', { email });
      throw new AuthenticationError('Email ou senha inválidos');
    }

    // Atualiza último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    logger.info('Usuário autenticado', { userId: user.id, email });

    // Gera tokens
    const tokens = JWTUtil.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Remove password da resposta
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  }

  /**
   * Refresh token - obtém novo access token
   * @param {string} refreshToken - Token de renovação
   * @returns {Promise<Object>} - { accessToken, refreshToken }
   */
  static async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new AuthenticationError('Refresh token não fornecido');
    }

    try {
      const decoded = JWTUtil.verifyToken(refreshToken);

      // Gera novos tokens
      const tokens = JWTUtil.generateTokens({
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      });

      logger.info('Token renovado', { userId: decoded.id });

      return tokens;
    } catch (error) {
      logger.warn('Tentativa de refresh com token inválido', { error: error.message });
      throw new AuthenticationError('Refresh token inválido ou expirado');
    }
  }

  /**
   * Verifica se um token é válido
   * @param {string} token - Token a verificar
   * @returns {Promise<Object>} - Dados do token
   */
  static async verifyToken(token) {
    try {
      return JWTUtil.verifyToken(token);
    } catch (error) {
      throw new AuthenticationError('Token inválido');
    }
  }

  /**
   * Solicita recuperação de senha
   * @param {string} email - Email do usuário
   * @returns {Promise<Object>} - { message }
   */
  static async requestPasswordReset(email) {
    if (!email) {
      throw new ValidationError('Email é obrigatório');
    }

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Não revela se email existe ou não (segurança)
    if (!user) {
      logger.info('Solicitação de reset de senha para email não existente', { email });
      return { message: 'Se o email existe, você receberá instruções' };
    }

    // Gera token de reset (validade 1 hora)
    const resetToken = JWTUtil.generateAccessToken({
      id: user.id,
      email: user.email,
      type: 'password-reset'
    });

    // Guarda token (em produção, usar hash)
    // TODO: Implementar armazenamento seguro do token

    logger.info('Reset de senha solicitado', { userId: user.id });

    // TODO: Enviar email com link de reset
    // const resetLink = `${config.FRONT_URL}/reset-password?token=${resetToken}`;

    return { message: 'Se o email existe, você receberá instruções' };
  }

  /**
   * Reseta a senha do usuário
   * @param {Object} data - { token, newPassword }
   * @returns {Promise<Object>} - { message }
   */
  static async resetPassword(data) {
    const { token, newPassword } = data;

    if (!token || !newPassword) {
      throw new ValidationError('Token e nova senha são obrigatórios');
    }

    // Verifica token
    let decoded;
    try {
      decoded = JWTUtil.verifyToken(token);
      if (decoded.type !== 'password-reset') {
        throw new Error('Token inválido');
      }
    } catch (error) {
      logger.warn('Tentativa de reset com token inválido', { error: error.message });
      throw new AuthenticationError('Link de reset inválido ou expirado');
    }

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      throw new NotFoundError('Usuário');
    }

    // Valida força da senha
    const validation = PasswordUtil.validatePasswordStrength(newPassword);
    if (!validation.valid) {
      throw new ValidationError('Senha fraca', validation.errors);
    }

    // Hash da nova senha
    const hashedPassword = await PasswordUtil.hashPassword(newPassword);

    // Atualiza senha
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    logger.info('Senha resetada', { userId: user.id });

    return { message: 'Senha alterada com sucesso' };
  }

  /**
   * Altera a senha do usuário (requer senha atual)
   * @param {string} userId - ID do usuário
   * @param {Object} data - { currentPassword, newPassword }
   * @returns {Promise<Object>} - { message }
   */
  static async changePassword(userId, data) {
    const { currentPassword, newPassword } = data;

    if (!currentPassword || !newPassword) {
      throw new ValidationError('Senha atual e nova senha são obrigatórias');
    }

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('Usuário');
    }

    // Verifica senha atual
    const passwordValid = await PasswordUtil.comparePassword(currentPassword, user.password);
    if (!passwordValid) {
      throw new AuthenticationError('Senha atual incorreta');
    }

    // Valida força da nova senha
    const validation = PasswordUtil.validatePasswordStrength(newPassword);
    if (!validation.valid) {
      throw new ValidationError('Senha fraca', validation.errors);
    }

    // Hash da nova senha
    const hashedPassword = await PasswordUtil.hashPassword(newPassword);

    // Atualiza senha
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    logger.info('Senha alterada', { userId });

    return { message: 'Senha alterada com sucesso' };
  }

  /**
   * Logout (revogação de token)
   * Em produção, implementar blacklist de tokens
   */
  static async logout(userId) {
    logger.info('Usuário fez logout', { userId });
    // TODO: Implementar token blacklist se necessário
    return { message: 'Logout realizado com sucesso' };
  }
}

export default AuthService;
