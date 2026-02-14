'use client'

/**
 * CartContext - Contexto do carrinho de compras
 * Gerencia itens do carrinho, cupons, cálculo de preços
 */

import React, { createContext, useState, useCallback, useEffect } from 'react';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [taxRate, setTaxRate] = useState(0.1); // 10% padrão

  // Carrega carrinho do localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (err) {
      console.error('Erro ao carregar carrinho:', err);
    }
  }, []);

  // Salva carrinho no localStorage sempre que muda
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  /**
   * Adiciona produto ao carrinho
   */
  const addItem = useCallback((product, quantity = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);

      if (existingItem) {
        // Aumenta quantidade
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      // Novo item
      return [
        ...prevItems,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0]?.imageUrl || '/placeholder.jpg',
          quantity,
          product
        }
      ];
    });
  }, []);

  /**
   * Remove produto do carrinho
   */
  const removeItem = useCallback((productId) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId));
  }, []);

  /**
   * Atualiza quantidade de um item
   */
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeItem]);

  /**
   * Limpa o carrinho
   */
  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
  }, []);

  /**
   * Aplica cupom de desconto
   */
  const applyCoupon = useCallback((couponData) => {
    setCoupon(couponData);
  }, []);

  /**
   * Remove cupom
   */
  const removeCoupon = useCallback(() => {
    setCoupon(null);
  }, []);

  /**
   * Calcula subtotal
   */
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  /**
   * Calcula desconto do cupom
   */
  const discountAmount = coupon
    ? coupon.type === 'PERCENTAGE'
      ? subtotal * (coupon.value / 100)
      : coupon.value
    : 0;

  /**
   * Calcula imposto
   */
  const tax = (subtotal - discountAmount) * taxRate;

  /**
   * Calcula total
   */
  const total = subtotal - discountAmount + tax + shippingCost;

  const value = {
    items,
    coupon,
    shippingCost,
    taxRate,
    subtotal,
    discountAmount,
    tax,
    total,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    setShippingCost,
    setTaxRate
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export default CartContext;
