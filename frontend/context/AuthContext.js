'use client'

/**
 * AuthContext - Contexto de autenticação
 * Gerencia login, registro, tokens e dados do usuário
 */

import React, { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Recupera tokens e usuário do localStorage ao iniciar
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedAccessToken = localStorage.getItem('accessToken');
        const savedUser = localStorage.getItem('user');

        if (savedAccessToken) {
          setAccessToken(savedAccessToken);
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      } catch (err) {
        console.error('Erro ao inicializar auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Registra novo usuário
   */
  const register = useCallback(async (name, email, password, phone) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        phone
      });

      const { user: newUser, accessToken: token, refreshToken: refresh } = response.data.data;

      // Salva no estado
      setUser(newUser);
      setAccessToken(token);
      setRefreshToken(refresh);

      // Salva no localStorage
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refresh);

      return { success: true, user: newUser };
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Erro ao registrar';
      setError(message);
      return { success: false, error: message };
    }
  }, [API_URL]);

  /**
   * Realiza login
   */
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      const { user: loggedUser, accessToken: token, refreshToken: refresh } = response.data.data;

      // Salva no estado
      setUser(loggedUser);
      setAccessToken(token);
      setRefreshToken(refresh);

      // Salva no localStorage
      localStorage.setItem('user', JSON.stringify(loggedUser));
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refresh);

      return { success: true, user: loggedUser };
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Email ou senha inválidos';
      setError(message);
      return { success: false, error: message };
    }
  }, [API_URL]);

  /**
   * Faz logout
   */
  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setError(null);

    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }, []);

  /**
   * Renova access token usando refresh token
   */
  const refreshAccessToken = useCallback(async () => {
    try {
      if (!refreshToken) return false;

      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken
      });

      const { accessToken: newToken } = response.data.data;
      setAccessToken(newToken);
      localStorage.setItem('accessToken', newToken);

      return true;
    } catch (err) {
      console.error('Erro ao renovar token:', err);
      logout();
      return false;
    }
  }, [refreshToken, API_URL, logout]);

  /**
   * Altera a senha do usuário
   */
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      setError(null);
      await axios.post(
        `${API_URL}/auth/change-password`,
        { currentPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Erro ao alterar senha';
      setError(message);
      return { success: false, error: message };
    }
  }, [accessToken, API_URL]);

  /**
   * Solicita recuperação de senha
   */
  const requestPasswordReset = useCallback(async (email) => {
    try {
      setError(null);
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Erro ao solicitar reset';
      setError(message);
      return { success: false, error: message };
    }
  }, [API_URL]);

  /**
   * Reseta a senha com token
   */
  const resetPassword = useCallback(async (token, newPassword) => {
    try {
      setError(null);
      await axios.post(`${API_URL}/auth/reset-password`, { token, newPassword });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Erro ao resetar senha';
      setError(message);
      return { success: false, error: message };
    }
  }, [API_URL]);

  const value = {
    user,
    accessToken,
    refreshToken,
    loading,
    error,
    isAuthenticated: !!user && !!accessToken,
    register,
    login,
    logout,
    changePassword,
    requestPasswordReset,
    resetPassword,
    refreshAccessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
