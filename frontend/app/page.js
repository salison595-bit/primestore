"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";
import InstagramFeed from "../components/InstagramFeed";
import Testimonials from "../components/Testimonials";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/products").then(res => setProducts(res.data)).catch(() => setProducts([]));
  }, []);

  async function comprar(product) {
    const res = await axios.post("http://localhost:5000/create-payment", {
      title: product.name,
      price: product.price
    });
    window.location.href = res.data.url;
  }

  return (
    <>
      <div className="bg-yellow text-black p-10">TESTE TAILWIND</div>
      <Hero />
      <section id="best" className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Mais vendidos</h2>
          <div className="text-zinc-400">Estoque dinâmico</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(p => (
            <ProductCard key={p.id} product={p} onBuy={comprar} />
          ))}
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold mb-6">Tendências do Instagram</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map(p => (
            <ProductCard key={p.id} product={p} onBuy={comprar} />
          ))}
        </div>
      </section>
      <InstagramFeed />
      <Testimonials />
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-graphite border border-graphite/60 p-6 rounded-xl shadow-soft flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Newsletter</h3>
            <p className="text-zinc-400">Ganhe um cupom exclusivo ao se inscrever.</p>
          </div>
          <form className="flex gap-3">
            <input className="px-4 py-2 rounded bg-black border border-graphite" placeholder="Seu e-mail" />
            <button className="px-6 py-2 rounded bg-yellow text-black font-semibold transition-all duration-300 hover:brightness-110">Assinar</button>
          </form>
        </div>
      </section>
    </>
  );
}
