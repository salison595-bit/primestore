'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const DashboardContent = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (user?.role !== 'ADMIN' && user?.role !== 'SUPERADMIN') {
      router.push('/');
      return;
    }

    fetchDashboard();
  }, [user, days, router]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/admin/dashboard?days=${days}`);
      setDashboard(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando dashboard...</div>;
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Painel Administrativo</h1>
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          <option value={7}>Últimos 7 dias</option>
          <option value={30}>Últimos 30 dias</option>
          <option value={90}>Últimos 90 dias</option>
          <option value={365}>Último ano</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-yellow-500">
          <p className="text-gray-600 text-sm font-medium">Receita Total</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            R$ {(dashboard?.metrics.totalRevenue || 0).toLocaleString('pt-BR', { 
              minimumFractionDigits: 2 
            })}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium">Total de Pedidos</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {dashboard?.metrics.totalOrders || 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-purple-500">
          <p className="text-gray-600 text-sm font-medium">Pedidos Pendentes</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {dashboard?.metrics.pendingOrders || 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium">Clientes Novos</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {dashboard?.metrics.newUsers || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Produtos com Estoque Baixo */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Estoque Baixo</h2>
          {dashboard?.alerts.lowStockProducts?.length > 0 ? (
            <ul className="space-y-3">
              {dashboard.alerts.lowStockProducts.map((product) => (
                <li key={product.id} className="flex justify-between items-center pb-3 border-b">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    {product.stock}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">Todos os produtos têm estoque suficiente</p>
          )}
        </div>

        {/* Produtos Mais Vendidos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Produtos Top 10</h2>
          {dashboard?.topProducts?.length > 0 ? (
            <ul className="space-y-3">
              {dashboard.topProducts.slice(0, 5).map((product, index) => (
                <li key={product.id} className="flex justify-between items-center pb-3 border-b">
                  <div>
                    <p className="font-medium text-gray-900">{index + 1}. {product.name}</p>
                    <p className="text-sm text-gray-600">{product.orders} pedidos</p>
                  </div>
                  <span className="text-lg font-bold text-yellow-600">{product.totalSold}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">Sem dados de vendas</p>
          )}
        </div>
      </div>

      {/* Pedidos Pendentes */}
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Pedidos Pendentes</h2>
        {dashboard?.alerts.pendingOrders?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Pedido</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Cliente</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Valor</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status Pagamento</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.alerts.pendingOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-900">{order.user.name}</td>
                    <td className="px-4 py-3 text-gray-900">
                      R$ {(order.totalAmount || 0).toLocaleString('pt-BR', { 
                        minimumFractionDigits: 2 
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.payment?.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : order.payment?.status === 'PROCESSING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.payment?.status || 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">Nenhum pedido pendente</p>
        )}
      </div>
    </div>
  );
};

export default DashboardContent;
