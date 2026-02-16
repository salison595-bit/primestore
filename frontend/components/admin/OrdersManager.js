'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const OrdersManager = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const statuses = [
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'RETURNED',
  ];

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page,
        limit: 15,
        ...(statusFilter && { status: statusFilter }),
      });
      const response = await api.get(`/api/admin/orders?${params}`);
      setOrders(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    if (user?.role !== 'ADMIN' && user?.role !== 'SUPERADMIN') {
      router.push('/');
      return;
    }

    fetchOrders();
  }, [user, router, fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId);
      await api.patch(`/api/admin/orders/${orderId}/status`, {
        status: newStatus,
      });
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao atualizar pedido');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      RETURNED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando pedidos...</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Pedidos</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          <option value="">Todos os Status</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div
              className="p-6 border-b cursor-pointer hover:bg-gray-50"
              onClick={() =>
                setExpandedId(expandedId === order.id ? null : order.id)
              }
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg text-gray-900">
                    {order.orderNumber}
                  </p>
                  <p className="text-sm text-gray-600">{order.user.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    R$ {order.totalAmount?.toLocaleString('pt-BR', { 
                      minimumFractionDigits: 2 
                    }) || '0,00'}
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            </div>

            {expandedId === order.id && (
              <div className="p-6 bg-gray-50">
                {/* Detalhes do Pedido */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Itens do Pedido</h3>
                  <div className="space-y-2">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm text-gray-700"
                      >
                        <span>
                          {item.product?.name} x {item.quantity}
                        </span>
                        <span>
                          R$ {(item.priceAtOrder * item.quantity).toLocaleString(
                            'pt-BR',
                            { minimumFractionDigits: 2 }
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Informações de Pagamento */}
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold text-gray-900 mb-3">Pagamento</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Método:</span>
                      <span className="text-gray-900 font-medium">
                        {order.payment?.method || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          order.payment?.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.payment?.status || 'Pendente'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Atualizar Status */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Atualizar Status
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => (
                      status !== order.orderStatus && (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(order.id, status)}
                          disabled={updatingStatus === order.id}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 text-sm"
                        >
                          {updatingStatus === order.id ? 'Atualizando...' : status}
                        </button>
                      )
                    ))}
                  </div>
                </div>

                {/* Informações do Cliente */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Informações do Cliente
                  </h3>
                  <div className="text-sm space-y-1 text-gray-700">
                    <p>Email: {order.user.email}</p>
                    <p>
                      Data do Pedido:{' '}
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          Nenhum pedido encontrado
        </div>
      )}
    </div>
  );
};

export default OrdersManager;
