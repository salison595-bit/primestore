'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-black pt-20 flex items-center justify-center overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-600/5 via-black to-black"></div>

      {/* Grid background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(212, 175, 55, .05) 25%, rgba(212, 175, 55, .05) 26%, transparent 27%, transparent 74%, rgba(212, 175, 55, .05) 75%, rgba(212, 175, 55, .05) 76%, transparent 77%, transparent),
                            linear-gradient(90deg, transparent 24%, rgba(212, 175, 55, .05) 25%, rgba(212, 175, 55, .05) 26%, transparent 27%, transparent 74%, rgba(212, 175, 55, .05) 75%, rgba(212, 175, 55, .05) 76%, transparent 77%, transparent)`,
            backgroundSize: '50px 50px',
          }}
        ></div>
      </div>

      {/* Glowing orb background */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-yellow-600/10 rounded-full filter blur-3xl opacity-20"></div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        {/* Main heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
          <span className="text-white">ELEVE SEU</span>
          <br />
          <span className="text-yellow-600">NÍVEL COM A PRIME</span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-lg sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
          Produtos premium com qualidade absoluta. Tecnologia, moda e estilo reunidos em um único lugar.
        </p>

        {/* CTA Button */}
        <Link
          href="/produtos"
          className="inline-block bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-4 px-8 uppercase tracking-widest transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          VER PRODUTOS
        </Link>

        {/* Decorative line */}
        <div className="mt-12 flex justify-center">
          <div className="h-1 w-16 bg-gradient-to-r from-transparent via-yellow-600 to-transparent"></div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="animate-bounce">
          <svg
            className="w-6 h-6 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
