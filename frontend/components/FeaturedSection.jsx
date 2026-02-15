export default function FeaturedSection() {
  const products = [
    { id: 1, name: 'Produto 1', price: 129.90 },
    { id: 2, name: 'Produto 2', price: 149.90 },
    { id: 3, name: 'Produto 3', price: 99.90 },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-3xl font-bold mb-12">Produtos em Destaque</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
            <div className="bg-gray-200 h-48 flex items-center justify-center">
              <span className="text-gray-500">Imagem do Produto</span>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <p className="text-blue-600 font-bold text-xl">R$ {product.price.toFixed(2)}</p>
              <button className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                Ver Detalhes
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
