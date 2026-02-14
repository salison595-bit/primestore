/**
 * Serviço de produtos
 * Operações relacionadas a produtos
 */

import api from './api';

export const productService = {
  /**
   * Lista todos os produtos
   */
  async getAll(page = 1, limit = 20, filters = {}) {
    try {
      const response = await api.get('/products', {
        params: {
          page,
          limit,
          ...filters
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Busca um produto específico por ID
   */
  async getById(id) {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Busca produtos por termos
   */
  async search(query, page = 1, limit = 20) {
    try {
      const response = await api.get('/products/search', {
        params: { q: query, page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Filtra produtos por categoria
   */
  async getByCategory(categoryId, page = 1, limit = 20) {
    try {
      const response = await api.get('/products/category/' + categoryId, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtém produtos em destaque
   */
  async getFeatured(limit = 10) {
    try {
      const response = await api.get('/products/featured', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtém produtos mais vendidos
   */
  async getTopSelling(limit = 10) {
    try {
      const response = await api.get('/products/top-selling', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Cria novo produto (admin)
   */
  async create(productData) {
    try {
      const response = await api.post('/admin/products', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Atualiza um produto (admin)
   */
  async update(id, productData) {
    try {
      const response = await api.put(`/admin/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Deleta um produto (admin)
   */
  async delete(id) {
    try {
      const response = await api.delete(`/admin/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default productService;
