"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useCart } from "../../../components/CartProvider";

export default function ProductPage({ params }) {
  const { dispatch } = useCart();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/products").then(res => {
      const p = res.data.find(x => x.id === params.id);
      setProduct(p || null);
    });
  }, [params.id]);

  if (!product) return <div className="max-w-7xl mx-auto px-6 py-16">Produto não encontrado</div>;

  async function pix() {
    const res = await axios.post("http://localhost:5000/create-payment", {
      title: product.name,
      price: product.price
    });
    window.location.href = res.data.url;
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-10">
      <div>
        <div className="relative w-full h-96 rounded-xl overflow-hidden bg-zinc-900">
          <Image src={product.image} alt={product.name} fill className="object-cover" />
        </div>
        <div className="mt-4 h-40 rounded-xl bg-zinc-900" />
      </div>
      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <div className="text-yellow text-2xl font-bold mt-2">R$ {product.price}</div>
        <p className="text-zinc-400 mt-4">{product.description}</p>
        <div className="text-yellow mt-2">★★★★★</div>
        <div className="mt-6 flex gap-3">
          <button onClick={pix} className="px-6 py-3 rounded bg-yellow text-black font-semibold">Comprar com Pix</button>
          <button onClick={() => dispatch({ type: "add", item: product })} className="px-6 py-3 rounded border border-graphite">Adicionar ao carrinho</button>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-zinc-900 p-4 rounded-xl">Entrega rápida</div>
          <div className="bg-zinc-900 p-4 rounded-xl">Pagamento seguro</div>
          <div className="bg-zinc-900 p-4 rounded-xl">Garantia</div>
        </div>
      </div>
    </section>
  );
}
