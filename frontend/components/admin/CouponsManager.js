'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const CouponsManager = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountPercentage: 0,
    discountValue: 0,
    maxUses: null,
    validUntil: '',
  });

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/admin/coupons');
      setCoupons(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar cupons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role !== 'ADMIN' && user?.role !== 'SUPERADMIN') {
      router.push('/');
      return;
    }

    fetchCoupons();
  }, [user, router, fetchCoupons]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/admin/coupons/${editingId}`, formData);
      } else {
        await api.post('/api/admin/coupons', formData);
      }
      resetForm();
      fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar cupom');
    }
  };

  const handleEdit = (coupon) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountPercentage: coupon.discountPercentage || 0,
      discountValue: coupon.discountValue || 0,
      maxUses: coupon.maxUses || '',
      validUntil: coupon.validUntil?.split('T')[0] || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (couponId) => {
    if (!confirm('Tem certeza que deseja deletar este cupom?')) return;

    try {
      await api.delete(`/api/admin/coupons/${couponId}`);
      fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao deletar cupom');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountPercentage: 0,
      discountValue: 0,
      maxUses: null,
      validUntil: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando cupons...</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Cupons</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium"
          >
            + Novo Cupom
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingId ? 'Editar Cupom' : 'Novo Cupom'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="EX: DESCONTO10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Ex: Desconto de boas-vindas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Desconto
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountType: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="PERCENTAGE">Percentual (%)</option>
                  <option value="FIXED">Valor Fixo (R$)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.discountType === 'PERCENTAGE'
                    ? 'Percentual de Desconto'
                    : 'Valor de Desconto'}
                </label>
                <input
                  type="number"
                  value={
                    formData.discountType === 'PERCENTAGE'
                      ? formData.discountPercentage
                      : formData.discountValue
                  }
                  onChange={(e) => {
                    if (formData.discountType === 'PERCENTAGE') {
                      setFormData({
                        ...formData,
                        discountPercentage: parseFloat(e.target.value),
                      });
                    } else {
                      setFormData({
                        ...formData,
                        discountValue: parseFloat(e.target.value),
                      });
                    }
                  }}
                  required
                  min="0"
                  max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Máximo de Usos
                </label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxUses: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Deixar em branco para ilimitado"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Válido Até
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      validUntil: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium"
              >
                {editingId ? 'Atualizar' : 'Criar'} Cupom
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {coupon.code}
              </h3>
              <p className="text-sm text-gray-600">{coupon.description}</p>
            </div>

            <div className="mb-4 pb-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Desconto:</span>
                <span className="font-bold text-lg text-yellow-600">
                  {coupon.discountType === 'PERCENTAGE'
                    ? `${coupon.discountPercentage}%`
                    : `R$ ${coupon.discountValue.toFixed(2)}`}
                </span>
              </div>
              {coupon.maxUses && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Usos:</span>
                  <span className="text-gray-900">
                    {coupon._count?.usages || 0} / {coupon.maxUses}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(coupon)}
                className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(coupon.id)}
                className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium text-sm"
              >
                Deletar
              </button>
            </div>
          </div>
        ))}
      </div>

      {coupons.length === 0 && !showForm && (
        <div className="text-center py-8 text-gray-600">
          Nenhum cupom criado ainda
        </div>
      )}
    </div>
  );
};

export default CouponsManager;
