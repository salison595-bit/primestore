'use client'

/**
 * Hook useCart
 * Fornece acesso fácil ao contexto do carrinho
 */

import { useContext } from 'react';
import CartContext from '../context/CartContext';

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }

  return context;
}

export default useCart;
