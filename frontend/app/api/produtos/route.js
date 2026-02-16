export async function GET() {
  const products = [
    {
      id: '1',
      name: 'PRIME ESSENTIALS TEE',
      price: 129.9,
      image: 'https://images.unsplash.com/photo-1520975731300-1425cd5017e4',
      description: 'Camiseta premium em algodão 100% puro',
      category: 'Camisetas',
    },
    {
      id: '2',
      name: 'PRIME TECH HOODIE',
      price: 249.9,
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246',
      description: 'Moletom tecnológico com clima control',
      category: 'Hoodies',
    },
    {
      id: '3',
      name: 'PRIME SNEAKER',
      price: 399.9,
      image: 'https://images.unsplash.com/photo-1600180758890-6b94519a8c79',
      description: 'Sneaker premium com solado confortável',
      category: 'Calçados',
    },
  ];

  return Response.json({ data: products });
}
