'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import DashboardContent from '@/components/admin/DashboardContent';
import ProductsManager from '@/components/admin/ProductsManager';
import OrdersManager from '@/components/admin/OrdersManager';
import CouponsManager from '@/components/admin/CouponsManager';
import SuppliersManager from '@/components/admin/SuppliersManager';

const AdminPage = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
    router.push('/');
    return null;
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'products', label: 'Produtos', icon: '📦' },
    { id: 'orders', label: 'Pedidos', icon: '📋' },
    { id: 'coupons', label: 'Cupons', icon: '🎟️' },
    { id: 'suppliers', label: 'Fornecedores', icon: '🏭' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto px-6 py-4 max-w-7xl">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Prime Store Admin</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{user.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-white shadow min-h-screen">
          <nav className="p-6">
            <ul className="space-y-2">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                      activeTab === tab.id
                        ? 'bg-yellow-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {activeTab === 'dashboard' && <DashboardContent />}
          {activeTab === 'products' && <ProductsManager />}
          {activeTab === 'orders' && <OrdersManager />}
          {activeTab === 'coupons' && <CouponsManager />}
          {activeTab === 'suppliers' && <SuppliersManager />}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
