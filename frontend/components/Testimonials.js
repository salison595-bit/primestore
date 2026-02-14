export default function Testimonials() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-2xl font-bold mb-6">Depoimentos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 p-6 rounded-xl shadow-soft">
          <p className="text-zinc-300">Incrível qualidade e entrega rápida.</p>
          <div className="text-yellow mt-3">★★★★★</div>
        </div>
        <div className="bg-zinc-900 p-6 rounded-xl shadow-soft">
          <p className="text-zinc-300">A loja tem um visual premium.</p>
          <div className="text-yellow mt-3">★★★★★</div>
        </div>
        <div className="bg-zinc-900 p-6 rounded-xl shadow-soft">
          <p className="text-zinc-300">Comprei pelo Instagram sem problemas.</p>
          <div className="text-yellow mt-3">★★★★★</div>
        </div>
      </div>
    </section>
  );
}
