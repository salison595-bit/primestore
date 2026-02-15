export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">PRIME STORE</div>
          <nav className="hidden md:flex gap-8">
            <a href="/" className="text-gray-700 hover:text-blue-600">Home</a>
            <a href="/produtos" className="text-gray-700 hover:text-blue-600">Produtos</a>
            <a href="/checkout" className="text-gray-700 hover:text-blue-600">Carrinho</a>
          </nav>
          <button className="md:hidden">Menu</button>
        </div>
      </div>
    </header>
  );
}
