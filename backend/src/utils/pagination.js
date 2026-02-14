/**
 * Utilitários de paginação
 * Processa parâmetros de paginação e formata respostas
 */

import { PAGINATION } from '../config/constants.js';

class PaginationUtil {
  /**
   * Processa e valida parâmetros de paginação
   * @param {number} page - Número da página
   * @param {number} limit - Itens por página
   * @returns {Object} - { page, limit, skip }
   */
  static parsePagination(page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT) {
    let parsedPage = parseInt(page, 10);
    let parsedLimit = parseInt(limit, 10);

    // Validação
    if (isNaN(parsedPage) || parsedPage < 1) {
      parsedPage = PAGINATION.DEFAULT_PAGE;
    }

    if (isNaN(parsedLimit) || parsedLimit < 1) {
      parsedLimit = PAGINATION.DEFAULT_LIMIT;
    } else if (parsedLimit > PAGINATION.MAX_LIMIT) {
      parsedLimit = PAGINATION.MAX_LIMIT;
    }

    return {
      page: parsedPage,
      limit: parsedLimit,
      skip: (parsedPage - 1) * parsedLimit
    };
  }

  /**
   * Formata resposta paginada
   * @param {Array} data - Dados a paginar
   * @param {number} total - Total de registros
   * @param {number} page - Página atual
   * @param {number} limit - Itens por página
   * @returns {Object} - Resposta formatada
   */
  static formatPaginatedResponse(data, total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Valida limites de paginação
   * @param {Object} pagination - Objeto com page e limit
   * @returns {boolean} - true se válido
   */
  static isValid(pagination) {
    return (
      pagination.page >= 1 &&
      pagination.limit >= 1 &&
      pagination.limit <= PAGINATION.MAX_LIMIT
    );
  }
}

export default PaginationUtil;
