export default async function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';
  const baseEntries = [
    { url: siteUrl, lastModified: new Date().toISOString() },
    { url: `${siteUrl}/produtos`, lastModified: new Date().toISOString() },
  ];
  try {
    const res = await fetch(`${API}/products?limit=100`, { cache: 'no-store' });
    if (!res.ok) return baseEntries;
    const json = await res.json();
    const items = (json.data || []).map((p) => ({
      url: `${siteUrl}/produto/${p.id}`,
      lastModified: new Date().toISOString(),
    }));
    return [...baseEntries, ...items];
  } catch {
    return baseEntries;
  }
}
