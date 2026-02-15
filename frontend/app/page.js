'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import FeaturedSection from '../components/FeaturedSection';
import Footer from '../components/Footer';
import CartSidebar from '../components/CartSidebar';

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Close cart when escape is pressed
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsCartOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <>
      <Header />
      <Hero />
      <FeaturedSection />
      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
