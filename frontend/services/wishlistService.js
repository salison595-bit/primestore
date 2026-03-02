/**
 * Serviço de Wishlist (Lista de Desejos)
 * Requer token de autenticação
 */

import api from './api';

export const wishlistService = {
  async getAll() {
    const response = await api.get('/wishlist');
    return response.data;
  },

  async add(productId) {
    const response = await api.post('/wishlist', { productId });
    return response.data;
  },

  async remove(productId) {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data;
  },

  async check(productId) {
    const response = await api.get(`/wishlist/check/${productId}`);
    return response.data;
  }
};

export default wishlistService;
