/**
 * Utilitários para criptografia de senha
 * Usando bcryptjs para hash seguro
 */

import bcryptjs from 'bcryptjs';
import { PASSWORD } from '../config/constants.js';

class PasswordUtil {
  /**
   * Criptografa uma senha
   * @param {string} password - Senha em texto plano
   * @returns {Promise<string>} - Senha criptografada
   */
  static async hashPassword(password) {
    const salt = await bcryptjs.genSalt(PASSWORD.SALT_ROUNDS);
    return bcryptjs.hash(password, salt);
  }

  /**
   * Verifica se uma senha corresponde ao hash
   * @param {string} password - Senha em texto plano
   * @param {string} hash - Hash armazenado
   * @returns {Promise<boolean>} - true se corresponder
   */
  static async comparePassword(password, hash) {
    return bcryptjs.compare(password, hash);
  }

  /**
   * Valida força da senha
   * @param {string} password - Senha a validar
   * @returns {Object} - { valid, errors }
   */
  static validatePasswordStrength(password) {
    const errors = [];

    if (password.length < PASSWORD.MIN_LENGTH) {
      errors.push(`Mínimo ${PASSWORD.MIN_LENGTH} caracteres`);
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Deve conter letra minúscula');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Deve conter letra maiúscula');
    }

    if (!/\d/.test(password)) {
      errors.push('Deve conter número');
    }

    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Deve conter caractere especial (@$!%*?&)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Gera uma senha aleatória
   * @param {number} length - Comprimento da senha
   * @returns {string} - Senha gerada
   */
  static generateRandomPassword(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}

export default PasswordUtil;
