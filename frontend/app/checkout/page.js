"use client"
import axios from "axios";
import { useCart } from "../../components/CartProvider";

export default function Checkout() {
  const { state, dispatch } = useCart();
  const total = state.items.reduce((sum, i) => sum + i.price * i.qty, 0);

  async function finalizar() {
    const items = state.items.map(i => ({
      title: i.name,
      unit_price: i.price,
      quantity: i.qty
    }));
    const res = await axios.post("http://localhost:5000/create-payment", { items });
    window.location.href = res.data.url;
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          {state.items.map(item => (
            <div key={item.id} className="bg-zinc-900 p-4 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-zinc-400">Qtd: {item.qty}</div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => dispatch({ type: "dec", id: item.id })} className="px-2 py-1 rounded border border-graphite">-</button>
                <button onClick={() => dispatch({ type: "inc", id: item.id })} className="px-2 py-1 rounded border border-graphite">+</button>
                <button onClick={() => dispatch({ type: "remove", id: item.id })} className="px-3 py-1 rounded border border-graphite">Remover</button>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-zinc-900 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Subtotal</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>
          <div className="mt-6 space-y-3">
            <input className="w-full px-4 py-2 rounded bg-black border border-graphite" placeholder="Cupom" />
            <button onClick={finalizar} className="w-full px-6 py-3 rounded bg-yellow text-black font-semibold">Finalizar Compra</button>
          </div>
        </div>
      </div>
    </section>
  );
}
