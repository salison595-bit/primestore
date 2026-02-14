/**
 * Utilitários para JWT (JSON Web Token)
 * Geração e verificação de tokens
 */

import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

class JWTUtil {
  /**
   * Gera um access token
   * @param {Object} payload - Dados a incluir no token
   * @returns {string} - Token JWT
   */
  static generateAccessToken(payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRATION
    });
  }

  /**
   * Gera um refresh token
   * @param {Object} payload - Dados a incluir no token
   * @returns {string} - Token JWT
   */
  static generateRefreshToken(payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.REFRESH_TOKEN_EXPIRATION
    });
  }

  /**
   * Gera ambos access e refresh tokens
   * @param {Object} payload - Dados a incluir nos tokens
   * @returns {Object} - { accessToken, refreshToken }
   */
  static generateTokens(payload) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload)
    };
  }

  /**
   * Verifica um token JWT
   * @param {string} token - Token a verificar
   * @returns {Object} - Payload decodificado
   * @throws {Error} - Se o token for inválido
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, config.JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }

  /**
   * Decodifica um token sem verificar
   * @param {string} token - Token a decodificar
   * @returns {Object} - Payload decodificado
   */
  static decodeToken(token) {
    return jwt.decode(token);
  }

  /**
   * Extrai o token do header Authorization
   * @param {string} authHeader - Header Authorization
   * @returns {string|null} - Token ou null
   */
  static extractTokenFromHeader(authHeader) {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return null;
    }
    
    return parts[1];
  }
}

export default JWTUtil;
