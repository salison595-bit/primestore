'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats] = useState({
    totalOrders: 156,
    totalRevenue: 45890.50,
    totalProducts: 24,
    todayOrders: 12,
  });
  const [products] = useState([
    {
      id: '1',
      name: 'PRIME ESSENTIALS TEE',
      price: 129.90,
      stock: 45,
      sales: 234,
    },
    {
      id: '2',
      name: 'PRIME TECH HOODIE',
      price: 249.90,
      stock: 23,
      sales: 156,
    },
    {
      id: '3',
      name: 'PRIME SNEAKER',
      price: 399.90,
      stock: 12,
      sales: 89,
    },
  ]);

  const [orders] = useState([
    {
      id: '#12345',
      customer: 'João Silva',
      total: 345.90,
      status: 'Delivered',
      date: '2026-02-13',
    },
    {
      id: '#12344',
      customer: 'Maria Santos',
      total: 245.50,
      status: 'Processing',
      date: '2026-02-14',
    },
    {
      id: '#12343',
      customer: 'Pedro Costa',
      total: 129.90,
      status: 'Shipped',
      date: '2026-02-14',
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-600/20 text-green-600';
      case 'Processing':
        return 'bg-yellow-600/20 text-yellow-600';
      case 'Shipped':
        return 'bg-blue-600/20 text-blue-600';
      default:
        return 'bg-gray-600/20 text-gray-600';
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">
            PAINEL DE <span className="text-yellow-600">ADMINISTRAÇÃO</span>
          </h1>
          <p className="text-gray-400">Gerencie sua loja e visualize estatísticas</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800 overflow-x-auto">
          {[
            { id: 'overview', label: 'Visão Geral' },
            { id: 'products', label: 'Produtos' },
            { id: 'orders', label: 'Pedidos' },
            { id: 'analytics', label: 'Análises' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-yellow-600 text-yellow-600'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: 'Pedidos Totais',
                  value: stats.totalOrders,
                  color: 'text-blue-600',
                },
                {
                  label: 'Faturamento',
                  value: `R$ ${stats.totalRevenue.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}`,
                  color: 'text-green-600',
                },
                {
                  label: 'Produtos',
                  value: stats.totalProducts,
                  color: 'text-yellow-600',
                },
                {
                  label: 'Pedidos Hoje',
                  value: stats.todayOrders,
                  color: 'text-purple-600',
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-gray-900 border border-gray-800 rounded p-6"
                >
                  <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-gray-900 border border-gray-800 rounded p-6">
              <h2 className="text-xl font-semibold mb-6">Pedidos Recentes</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400">
                        Número
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400">
                        Cliente
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400">
                        Total
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-yellow-600">
                          {order.id}
                        </td>
                        <td className="py-3 px-4">{order.customer}</td>
                        <td className="py-3 px-4 font-bold">
                          R$ {order.total.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded text-xs font-semibold ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {new Date(order.date).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Produtos</h2>
              <button className="bg-yellow-600 text-black px-6 py-2 rounded font-semibold hover:bg-yellow-500 transition-colors">
                + Novo Produto
              </button>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400">
                        Nome
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400">
                        Preço
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400">
                        Estoque
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400">
                        Vendas
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                        <td className="py-3 px-4 font-semibold">
                          {product.name}
                        </td>
                        <td className="py-3 px-4 text-yellow-600">
                          R$ {product.price.toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded text-xs font-semibold ${
                              product.stock > 20
                                ? 'bg-green-600/20 text-green-600'
                                : 'bg-red-600/20 text-red-600'
                            }`}
                          >
                            {product.stock} unidades
                          </span>
                        </td>
                        <td className="py-3 px-4">{product.sales}</td>
                        <td className="py-3 px-4">
                          <button className="text-yellow-600 hover:text-yellow-500 mr-4">
                            Editar
                          </button>
                          <button className="text-red-600 hover:text-red-500">
                            Deletar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Todos os Pedidos</h2>

            <div className="bg-gray-900 border border-gray-800 rounded p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400">
                        Número
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400">
                        Cliente
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400">
                        Total
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400">
                        Data
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-yellow-600">
                          {order.id}
                        </td>
                        <td className="py-3 px-4">{order.customer}</td>
                        <td className="py-3 px-4 font-bold">
                          R$ {order.total.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded text-xs font-semibold ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {new Date(order.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4">
                          <button className="text-yellow-600 hover:text-yellow-500">
                            Ver Detalhes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Análises</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart Placeholder */}
              <div className="bg-gray-900 border border-gray-800 rounded p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Faturamento Mensal
                </h3>
                <div className="h-64 bg-gray-800 rounded flex items-center justify-center">
                  <p className="text-gray-500">Gráfico de receita (Integração com Chart.js)</p>
                </div>
              </div>

              {/* Top Products Placeholder */}
              <div className="bg-gray-900 border border-gray-800 rounded p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Produtos Mais Vendidos
                </h3>
                <div className="h-64 bg-gray-800 rounded flex items-center justify-center">
                  <p className="text-gray-500">Gráfico de produtos (Integração com Chart.js)</p>
                </div>
              </div>

              {/* Traffic Source */}
              <div className="bg-gray-900 border border-gray-800 rounded p-6">
                <h3 className="text-lg font-semibold mb-4">Fonte de Tráfego</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Direto', value: 45, color: 'bg-yellow-600' },
                    { name: 'Google', value: 30, color: 'bg-blue-600' },
                    { name: 'Social', value: 20, color: 'bg-purple-600' },
                    { name: 'Outros', value: 5, color: 'bg-gray-600' },
                  ].map((item) => (
                    <div key={item.name}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm font-semibold">{item.value}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded h-2">
                        <div
                          className={`${item.color} h-full rounded transition-all`}
                          style={{ width: `${item.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="bg-gray-900 border border-gray-800 rounded p-6">
                <h3 className="text-lg font-semibold mb-4">Métricas Chave</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Taxa de Conversão', value: '3.2%' },
                    { label: 'Ticket Médio', value: 'R$ 294.50' },
                    { label: 'Clientes Únicos', value: '1,240' },
                    { label: 'Taxa de Retorno', value: '18.5%' },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="flex justify-between border-b border-gray-800 pb-3"
                    >
                      <span className="text-gray-400">{metric.label}</span>
                      <span className="font-semibold text-yellow-600">
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
