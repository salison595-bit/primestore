/**
 * Serviço de pagamentos (frontend)
 * Cria sessão de checkout do Stripe
 */

import api from './api';

export const paymentService = {
  /**
   * Cria sessão de checkout do Stripe
   * Se orderId não existir, envia items do carrinho
   */
  async createStripeCheckoutSession({ orderId, items }) {
    try {
      const response = await api.post('/payments/stripe/checkout-session', {
        orderId,
        items,
      });
      return response.data?.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default paymentService;
