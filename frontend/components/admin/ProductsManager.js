'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const ProductsManager = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (user?.role !== 'ADMIN' && user?.role !== 'SUPERADMIN') {
      router.push('/');
      return;
    }

    fetchProducts();
  }, [user, page, search, router]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page,
        limit: 20,
        ...(search && { search }),
      });
      const response = await api.get(`/api/admin/products?${params}`);
      setProducts(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = (product) => {
    setEditingId(product.id);
    setEditData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      isActive: product.isActive,
    });
  };

  const handleEditSave = async () => {
    try {
      await api.put(`/api/admin/products/${editingId}`, editData);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao atualizar produto');
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return;

    try {
      await api.delete(`/api/admin/products/${productId}`);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao deletar produto');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando produtos...</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Produtos</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar produtos..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nome</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">SKU</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Preço</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estoque</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                {editingId === product.id ? (
                  <>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-6 py-4 text-gray-900">{product.sku}</td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={editData.price}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            price: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={editData.stock}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            stock: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editData.isActive}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              isActive: e.target.checked,
                            })
                          }
                          className="mr-2"
                        />
                        <span className={editData.isActive ? 'text-green-600' : 'text-red-600'}>
                          {editData.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </label>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={handleEditSave}
                        className="mr-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 text-gray-700">{product.sku}</td>
                    <td className="px-6 py-4 text-gray-900">
                      R$ {product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          product.stock > 10
                            ? 'bg-green-100 text-green-800'
                            : product.stock > 0
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          product.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEditStart(product)}
                        className="mr-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Deletar
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          Nenhum produto encontrado
        </div>
      )}
    </div>
  );
};

export default ProductsManager;
