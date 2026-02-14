'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerColumns = [
    {
      icon: '🚀',
      title: 'Entrega Rápida',
      description: 'Enviamos seus produtos em até 2 dias úteis com rastreamento',
    },
    {
      icon: '🛡️',
      title: 'Compra Segura',
      description: 'Proteção completa nas suas transações com certificação SSL',
    },
    {
      icon: '⭐',
      title: 'Qualidade Premium',
      description: 'Todos os produtos são testados e certificados',
    },
  ];

  const links = {
    Sobre: ['Sobre nós', 'Carreiras', 'Blog', 'Imprensa'],
    Suporte: ['Contato', 'FAQ', 'Devoluções', 'Garantia'],
    Legais: ['Privacidade', 'Termos', 'Cookies', 'Conformidade'],
  };

  return (
    <>
      {/* Features Section */}
      <section className="bg-gray-900 border-y border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {footerColumns.map((column, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl mb-3">{column.icon}</div>
                <h3 className="text-yellow-600 font-semibold text-lg mb-2">{column.title}</h3>
                <p className="text-gray-400 text-sm">{column.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <h3 className="text-yellow-600 font-bold text-lg mb-4">PRIME STORE</h3>
              <p className="text-gray-400 text-sm mb-6">
                Sua loja de produtos premium com qualidade garantida.
              </p>
              {/* Social Links */}
              <div className="flex gap-4">
                <a
                  href="https://instagram.com"
                  className="text-gray-400 hover:text-yellow-600 transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.057-1.645.069-4.849.069-3.205 0-3.584-.012-4.849-.069-3.259-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.756 0 8.331.012 7.052.07 2.696.272.273 2.69.07 7.052.012 8.331 0 8.756 0 12c0 3.244.011 3.668.07 4.948.202 4.358 2.612 6.78 6.979 6.98 1.281.058 1.7.07 4.948.07 3.259 0 3.668-.012 4.948-.07 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.071-1.699.071-4.948 0-3.244-.011-3.668-.07-4.948-.196-4.354-2.617-6.78-6.979-6.98C15.668.012 15.259 0 12 0z" />
                    <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162S8.597 18.162 12 18.162s6.162-2.759 6.162-6.162S15.403 5.838 12 5.838zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z" />
                  </svg>
                </a>
                <a
                  href="https://whatsapp.com"
                  className="text-gray-400 hover:text-yellow-600 transition-colors"
                  aria-label="WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.148.548 4.179 1.505 5.925L0 24l6.325-1.395C9.771 23.316 10.851 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10c-.955 0-1.877-.145-2.753-.415L3 20.362l1.262-3.743C3.236 15.213 2 13.724 2 12c0-5.523 4.477-10 10-10z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Links Sections */}
            {Object.entries(links).map(([section, items]) => (
              <div key={section}>
                <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-widest">
                  {section}
                </h4>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-yellow-600 transition-colors text-sm"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
              <p>© {currentYear} PRIME STORE. Todos os direitos reservados.</p>
              <p>Desenvolvido com ❤️ para você</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
