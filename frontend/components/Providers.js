'use client'

/**
 * Combined Provider Wrapper
 * Fornece Auth + Cart contexts juntos
 */

import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';

export function CombinedProviders({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  );
}

export default CombinedProviders;
