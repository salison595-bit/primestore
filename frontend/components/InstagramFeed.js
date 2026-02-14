export default function InstagramFeed() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Visto no Instagram</h2>
        <a href="https://ig.me/m/seuinstagram" className="text-yellow">Abrir Instagram</a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-zinc-900 h-44" />
        <div className="rounded-xl bg-zinc-900 h-44" />
        <div className="rounded-xl bg-zinc-900 h-44" />
        <div className="rounded-xl bg-zinc-900 h-44" />
      </div>
    </section>
  );
}
