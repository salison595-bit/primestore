/**
 * Rotas de autenticação
 * POST /api/auth/register
 * POST /api/auth/login
 * POST /api/auth/refresh
 * POST /api/auth/forgot-password
 * POST /api/auth/reset-password
 * POST /api/auth/change-password
 * POST /api/auth/logout
 * GET  /api/auth/me
 * GET  /api/auth/verify
 */

import express from 'express';
import AuthController from '../controllers/authController.js';
import { authMiddleware, optionalAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema
} from '../validators/authValidator.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Registra novo usuário
 * Public - Rate limited
 */
router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  AuthController.register
);

/**
 * POST /api/auth/login
 * Faz login do usuário
 * Public - Rate limited
 */
router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  AuthController.login
);

/**
 * POST /api/auth/refresh
 * Renova access token
 * Public
 */
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  AuthController.refresh
);

/**
 * POST /api/auth/forgot-password
 * Solicita recuperação de senha
 * Public - Rate limited
 */
router.post(
  '/forgot-password',
  authRateLimiter,
  validate(forgotPasswordSchema),
  AuthController.forgotPassword
);

/**
 * POST /api/auth/reset-password
 * Reseta a senha com token
 * Public
 */
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  AuthController.resetPassword
);

/**
 * POST /api/auth/change-password
 * Altera a senha (requer autenticação)
 * Protected
 */
router.post(
  '/change-password',
  authMiddleware,
  validate(changePasswordSchema),
  AuthController.changePassword
);

/**
 * POST /api/auth/logout
 * Faz logout do usuário
 * Protected
 */
router.post(
  '/logout',
  authMiddleware,
  AuthController.logout
);

/**
 * GET /api/auth/me
 * Retorna dados do usuário autenticado
 * Protected
 */
router.get(
  '/me',
  authMiddleware,
  AuthController.getMe
);

/**
 * GET /api/auth/verify
 * Verifica se token é válido
 * Public
 */
router.get(
  '/verify',
  AuthController.verify
);

export default router;
