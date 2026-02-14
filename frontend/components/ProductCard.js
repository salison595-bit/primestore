"use client"
import Image from "next/image";
import { useCart } from "./CartProvider";

export default function ProductCard({ product, onBuy }) {
  const { dispatch } = useCart();
  return (
    <div className="bg-graphite border border-graphite/60 p-5 rounded-xl shadow-soft transition-all duration-300 hover:scale-[1.02]">
      <div className="relative w-full h-48 mb-4">
        <Image src={product.image} alt={product.name} fill className="object-cover rounded" />
      </div>
      <h3 className="text-xl">{product.name}</h3>
      <p className="text-yellow font-bold">R$ {product.price}</p>
      <div className="flex gap-3 mt-4">
        <button onClick={() => onBuy(product)} className="bg-yellow text-black px-4 py-2 rounded font-bold transition-all duration-300 hover:brightness-110">Comprar</button>
        <button onClick={() => dispatch({ type: "add", item: product })} className="border border-graphite px-4 py-2 rounded transition-all duration-300 hover:brightness-110">Adicionar</button>
      </div>
    </div>
  );
}
