import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Truck,
  FileText,
  Receipt,
  FileBox,
  LogOut,
  Wallet
} from 'lucide-react';

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/customers', label: 'Master Customer', icon: <Users size={20} /> },
    { path: '/suppliers', label: 'Master Supplier', icon: <Truck size={20} /> },
    { path: '/quotations', label: 'Surat Penawaran', icon: <FileText size={20} /> },
    { path: '/invoices', label: 'Invoice', icon: <Receipt size={20} /> },
    { path: '/purchase-orders', label: 'Purchase Order', icon: <FileBox size={20} /> },
    { path: '/finance', label: 'Keuangan', icon: <Wallet size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-4 text-xl font-bold border-b border-slate-700 flex items-center gap-2">
          <span>Toko Komputer App</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-slate-300 hover:text-white w-full px-3 py-2 rounded-md hover:bg-slate-800 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm md:hidden p-4 flex justify-between items-center">
          <span className="font-bold text-lg text-slate-900">Toko Komputer</span>
          <button onClick={handleLogout} className="text-slate-600">
            <LogOut size={20} />
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
