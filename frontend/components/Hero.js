import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-black to-graphite">
      <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-5xl font-extrabold">Tecnologia para vender globalmente</h1>
          <p className="text-zinc-400 mt-4">Estrutura premium com performance, conversão e integração Instagram.</p>
          <div className="flex gap-4 mt-8">
            <Link href="#best" className="px-6 py-3 rounded bg-yellow text-black font-semibold">Comprar Agora</Link>
            <a href="https://ig.me/m/seuinstagram" className="px-6 py-3 rounded border border-yellow text-yellow">Ver no Instagram</a>
          </div>
        </div>
        <div className="rounded-xl bg-zinc-900 shadow-soft h-64 md:h-80" />
      </div>
    </section>
  );
}
