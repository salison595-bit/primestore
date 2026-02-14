/**
 * Funções de validação reutilizáveis
 * Validação de email, telefone, CPF, CNPJ, etc.
 */

import { VALIDATION } from '../config/constants.js';

export class ValidatorUtil {
  /**
   * Valida email
   * @param {string} email - Email a validar
   * @returns {boolean}
   */
  static isValidEmail(email) {
    return VALIDATION.EMAIL.test(email);
  }

  /**
   * Valida telefone brasileiro
   * @param {string} phone - Telefone a validar
   * @returns {boolean}
   */
  static isValidPhone(phone) {
    // Remove caracteres especiais e espaços
    const cleaned = phone?.replace(/\D/g, '');
    // Valida se tem 11 dígitos (com 55 do Brasil) ou 10 (sem)
    return cleaned?.length === 11 || cleaned?.length === 10;
  }

  /**
   * Valida CEP brasileiro
   * @param {string} zipCode - CEP a validar
   * @returns {boolean}
   */
  static isValidZipCode(zipCode) {
    const cleaned = zipCode?.replace(/\D/g, '');
    return cleaned?.length === 8;
  }

  /**
   * Valida CPF
   * @param {string} cpf - CPF a validar
   * @returns {boolean}
   */
  static isValidCPF(cpf) {
    // Remove caracteres especiais
    const cleaned = cpf?.replace(/\D/g, '');
    
    if (cleaned?.length !== 11) return false;
    
    // Valida se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleaned)) return false;
    
    // Calcula primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    // Calcula segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    return (
      digit1 === parseInt(cleaned.charAt(9)) &&
      digit2 === parseInt(cleaned.charAt(10))
    );
  }

  /**
   * Valida CNPJ
   * @param {string} cnpj - CNPJ a validar
   * @returns {boolean}
   */
  static isValidCNPJ(cnpj) {
    // Remove caracteres especiais
    const cleaned = cnpj?.replace(/\D/g, '');
    
    if (cleaned?.length !== 14) return false;
    
    // Valida se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cleaned)) return false;
    
    // Calcula primeiro dígito verificador
    let sum = 0;
    const multipliers1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleaned.charAt(i)) * multipliers1[i];
    }
    
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    // Calcula segundo dígito verificador
    sum = 0;
    const multipliers2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleaned.charAt(i)) * multipliers2[i];
    }
    
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    return (
      digit1 === parseInt(cleaned.charAt(12)) &&
      digit2 === parseInt(cleaned.charAt(13))
    );
  }

  /**
   * Valida URL
   * @param {string} url - URL a validar
   * @returns {boolean}
   */
  static isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Valida se é um positivo
   * @param {number} value - Valor a validar
   * @returns {boolean}
   */
  static isPositive(value) {
    return !isNaN(value) && value > 0;
  }

  /**
   * Valida se está dentro de um intervalo
   * @param {number} value - Valor
   * @param {number} min - Mínimo
   * @param {number} max - Máximo
   * @returns {boolean}
   */
  static isBetween(value, min, max) {
    return !isNaN(value) && value >= min && value <= max;
  }

  /**
   * Valida se data é no futuro
   * @param {Date} date - Data a validar
   * @returns {boolean}
   */
  static isFutureDate(date) {
    return new Date(date) > new Date();
  }

  /**
   * Valida se data é no passado
   * @param {Date} date - Data a validar
   * @returns {boolean}
   */
  static isPastDate(date) {
    return new Date(date) < new Date();
  }
}

export default ValidatorUtil;
