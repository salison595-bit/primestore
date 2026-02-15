export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Bem-vindo à PRIME STORE
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-blue-100">
          Moda Premium com Preços Acessíveis
        </p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
          Começar Compras
        </button>
      </div>
    </section>
  );
}
