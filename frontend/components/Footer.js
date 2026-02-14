export default function Footer() {
  return (
    <footer className="bg-black border-t border-graphite mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-yellow" />
            <span className="text-xl font-bold">Prime Store</span>
          </div>
          <p className="text-sm text-zinc-400 mt-4">Tecnologia e performance para e-commerce global.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Institucional</h4>
          <ul className="space-y-2 text-zinc-400">
            <li>Sobre</li>
            <li>Contato</li>
            <li>Privacidade</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Suporte</h4>
          <ul className="space-y-2 text-zinc-400">
            <li>Envio</li>
            <li>Garantia</li>
            <li>Trocas</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Redes</h4>
          <ul className="space-y-2 text-zinc-400">
            <li><a href="https://ig.me/m/seuinstagram">Instagram</a></li>
            <li><a href="https://wa.me/55SEUNUMERO">WhatsApp</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-graphite">
        <div className="max-w-7xl mx-auto px-6 py-6 text-sm text-zinc-500">© Prime Store</div>
      </div>
    </footer>
  );
}
