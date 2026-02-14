/**
 * Validadores de autenticação
 * Usa Zod para validação de schemas
 */

import z from 'zod';

/**
 * Schema de registro
 */
export const registerSchema = z.object({
  body: z.object({
    name: z.string()
      .min(3, 'Nome deve ter pelo menos 3 caracteres')
      .max(100, 'Nome muito longo'),
    email: z.string()
      .email('Email inválido'),
    password: z.string()
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .regex(/[A-Z]/, 'Deve conter letra maiúscula')
      .regex(/[a-z]/, 'Deve conter letra minúscula')
      .regex(/\d/, 'Deve conter número')
      .regex(/[@$!%*?&]/, 'Deve conter caractere especial'),
    phone: z.string().optional()
  })
});

/**
 * Schema de login
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Email inválido'),
    password: z.string()
      .min(1, 'Senha é obrigatória')
  })
});

/**
 * Schema de refresh token
 */
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string()
      .min(1, 'Refresh token é obrigatório')
  })
});

/**
 * Schema de forgot password
 */
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Email inválido')
  })
});

/**
 * Schema de reset password
 */
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string()
      .min(1, 'Token é obrigatório'),
    newPassword: z.string()
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .regex(/[A-Z]/, 'Deve conter letra maiúscula')
      .regex(/[a-z]/, 'Deve conter letra minúscula')
      .regex(/\d/, 'Deve conter número')
      .regex(/[@$!%*?&]/, 'Deve conter caractere especial')
  })
});

/**
 * Schema de change password
 */
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string()
      .min(1, 'Senha atual é obrigatória'),
    newPassword: z.string()
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .regex(/[A-Z]/, 'Deve conter letra maiúscula')
      .regex(/[a-z]/, 'Deve conter letra minúscula')
      .regex(/\d/, 'Deve conter número')
      .regex(/[@$!%*?&]/, 'Deve conter caractere especial')
  })
});

export default {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema
};
