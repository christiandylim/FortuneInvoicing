import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import {
  LayoutDashboard,
  Users,
  Truck,
  FileText,
  Receipt,
  FileBox,
  LogOut,
  Wallet,
  Settings as SettingsIcon,
  UserCog
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
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

  // Only show these to admin
  const adminMenuItems = [
    { path: '/users', label: 'User Management', icon: <UserCog size={20} /> },
    { path: '/settings', label: 'Pengaturan', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-4 border-b border-slate-700 flex flex-col items-center gap-2">
          {settings?.logoBase64 && (
            <img src={settings.logoBase64} alt="Logo" className="w-20 h-20 object-contain bg-white rounded p-1 mb-2" />
          )}
          <span className="text-xl font-bold text-center">{settings?.storeName || 'Toko Komputer App'}</span>
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

            {user?.role === 'admin' && (
              <>
                <li className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Admin Control
                </li>
                {adminMenuItems.map((item) => (
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
              </>
            )}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-700">
           <div className="mb-4 px-3 text-sm text-slate-400">
             Login sebagai: <span className="font-bold text-white">{user?.name || user?.username}</span>
           </div>
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
          <span className="font-bold text-lg text-slate-900">{settings?.storeName}</span>
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
