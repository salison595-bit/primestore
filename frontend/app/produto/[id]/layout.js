export async function generateMetadata({ params }) {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${API}/products/${params.id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load product');
    const json = await res.json();
    const p = json.data;
    if (!p) {
      return {
        title: 'Produto | PRIME STORE',
        description: 'Detalhes do produto',
        alternates: { canonical: `${siteUrl}/produto/${params.id}` },
      };
    }
    const base = new URL(API).origin;
    const img = `${base}/api/assets/image?url=${encodeURIComponent(p.imageUrl)}`;
    return {
      title: `${p.name} | PRIME STORE`,
      description: p.description || 'Produto premium da PRIME STORE',
      alternates: { canonical: `${siteUrl}/produto/${params.id}` },
      openGraph: {
        type: 'product',
        url: `${siteUrl}/produto/${params.id}`,
        title: p.name,
        description: p.description || 'Produto premium da PRIME STORE',
        images: [{ url: img, width: 1200, height: 630, alt: p.name }],
      },
      twitter: {
        card: 'summary_large_image',
        title: p.name,
        description: p.description || 'Produto premium da PRIME STORE',
        images: [img],
      },
    };
  } catch {
    return {
      title: 'Produto | PRIME STORE',
      description: 'Detalhes do produto',
      alternates: { canonical: `${(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')}/produto/${params.id}` },
    };
  }
}

export default function ProductLayout({ children }) {
  return children;
}
