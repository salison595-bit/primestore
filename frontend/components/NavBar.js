"use client"
import Link from "next/link";
import { useCart } from "./CartProvider";

export default function NavBar() {
  const { state } = useCart();
  const count = state.items.reduce((sum, i) => sum + i.qty, 0);
  return (
    <header className="fixed top-0 z-50 w-full bg-black/80 backdrop-blur border-b border-graphite shadow-soft">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-yellow" />
          <span className="text-xl font-bold">Prime Store</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="#best" className="px-4 py-2 rounded bg-yellow text-black font-semibold transition-all duration-300 hover:brightness-110">
            Comprar Agora
          </Link>
          <a href="https://ig.me/m/seuinstagram" className="px-4 py-2 rounded border border-yellow text-yellow transition-all duration-300 hover:brightness-110">
            Ver no Instagram
          </a>
          <Link href="/checkout" className="px-4 py-2 rounded border border-graphite transition-all duration-300 hover:brightness-110">
            Carrinho ({count})
          </Link>
        </nav>
      </div>
    </header>
  );
}
