/**
 * Utilitários de formatação de dados
 * Formata respostas padrão da API
 */

export class FormatterUtil {
  /**
   * Formata resposta de sucesso
   * @param {*} data - Dados a retornar
   * @param {string} message - Mensagem customizada
   * @param {Object} meta - Metadados adicionais
   * @returns {Object} - Resposta formatada
   */
  static successResponse(data = null, message = 'Sucesso', meta = {}) {
    return {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta
      }
    };
  }

  /**
   * Formata resposta de erro
   * @param {string} message - Mensagem de erro
   * @param {string} code - Código de erro
   * @param {*} details - Detalhes extras
   * @returns {Object} - Resposta formatada
   */
  static errorResponse(message, code = 'INTERNAL_ERROR', details = null) {
    return {
      success: false,
      error: {
        message,
        code,
        details,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Formata usuário para resposta (remove senha)
   * @param {Object} user - Objeto usuário
   * @returns {Object} - Usuário formatado
   */
  static formatUser(user) {
    if (!user) return null;
    
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Formata produto para resposta
   * @param {Object} product - Objeto produto
   * @returns {Object} - Produto formatado
   */
  static formatProduct(product) {
    if (!product) return null;
    
    return {
      ...product,
      priceFormatted: `R$ ${(product.price).toFixed(2)}`,
      originalPriceFormatted: product.originalPrice 
        ? `R$ ${(product.originalPrice).toFixed(2)}` 
        : null,
      discount: product.originalPrice 
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0
    };
  }

  /**
   * Formata pedido para resposta
   * @param {Object} order - Objeto pedido
   * @returns {Object} - Pedido formatado
   */
  static formatOrder(order) {
    if (!order) return null;
    
    return {
      ...order,
      totalFormatted: `R$ ${(order.total).toFixed(2)}`,
      subtotalFormatted: `R$ ${(order.subtotal).toFixed(2)}`,
      discountFormatted: `R$ ${(order.discountAmount).toFixed(2)}`,
      shippingCostFormatted: `R$ ${(order.shippingCost).toFixed(2)}`
    };
  }

  /**
   * Remove campos sensíveis de um objeto
   * @param {Object} obj - Objeto
   * @param {Array} fieldsToRemove - Campos a remover
   * @returns {Object} - Objeto sem campos
   */
  static removeFields(obj, fieldsToRemove = []) {
    const result = { ...obj };
    fieldsToRemove.forEach(field => {
      delete result[field];
    });
    return result;
  }
}

export default FormatterUtil;
