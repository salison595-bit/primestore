const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  title: 'Todos os Produtos | PRIME STORE',
  description: 'Explore a coleção completa de produtos premium da PRIME STORE.',
  openGraph: {
    type: 'website',
    url: `${siteUrl}/produtos`,
    title: 'Todos os Produtos | PRIME STORE',
    description: 'Explore a coleção completa de produtos premium da PRIME STORE.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: `${siteUrl}/produtos` },
};

export default function ProdutosLayout({ children }) {
  return children;
}
