/**
 * Configuração de CORS
 * Define as origens permitidas e headers customizados
 */

export const corsOptions = {
  origin: (origin, callback) => {
    const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';
    const devOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5000'
    ];
    const prodOrigins = [
      process.env.FRONT_URL,
      'https://primestore.vercel.app',
      'https://www.primestore.com.br',
      'https://primestore.com.br'
    ].filter(Boolean);
    const allowedOrigins = isProd ? prodOrigins : devOrigins.concat(prodOrigins);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS não autorizado'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'X-API-Key',
    'Accept'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Pagination-Limit'
  ],
  maxAge: 86400 // 24 horas
};

export default corsOptions;
