import React, { useState, useEffect } from 'react';
import { db, collection, getDocs } from '../lib/db';
import { formatCurrency } from '../utils/format';
import { TrendingUp, TrendingDown, Users, FileText, Receipt, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalIn: 0,
    totalOut: 0,
    balance: 0,
    customerCount: 0,
    invoiceCount: 0,
    poCount: 0
  });

  const [recentFinance, setRecentFinance] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Fetch Finance
      const fSnap = await getDocs(collection(db, "finance"));
      const fData = fSnap.docs.map(d => d.data());

      const totalIn = fData.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.amount, 0);
      const totalOut = fData.filter(t => t.type === 'OUT').reduce((sum, t) => sum + t.amount, 0);

      const sortedFinance = [...fData].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

      // Fetch other stats
      const cSnap = await getDocs(collection(db, "customers"));
      const iSnap = await getDocs(collection(db, "invoices"));
      const poSnap = await getDocs(collection(db, "purchase_orders"));

      setStats({
        totalIn,
        totalOut,
        balance: totalIn - totalOut,
        customerCount: cSnap.docs.length,
        invoiceCount: iSnap.docs.length,
        poCount: poSnap.docs.length
      });

      setRecentFinance(sortedFinance);
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      {/* Finance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Pemasukan (Laba Kotor)</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalIn)}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full text-green-600">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Pengeluaran (Rugi/Beban)</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalOut)}</p>
          </div>
          <div className="bg-red-100 p-3 rounded-full text-red-600">
            <TrendingDown size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-sm p-6 text-white flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-100 mb-1">Laba Bersih / Saldo Akhir</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.balance)}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/customers" className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4 hover:bg-gray-50 transition">
          <div className="bg-purple-100 p-3 rounded-lg text-purple-600"><Users size={20}/></div>
          <div>
            <p className="text-sm text-gray-500">Total Customer</p>
            <p className="text-xl font-bold">{stats.customerCount}</p>
          </div>
        </Link>
        <Link to="/invoices" className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4 hover:bg-gray-50 transition">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Receipt size={20}/></div>
          <div>
            <p className="text-sm text-gray-500">Invoice Diterbitkan</p>
            <p className="text-xl font-bold">{stats.invoiceCount}</p>
          </div>
        </Link>
        <Link to="/purchase-orders" className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4 hover:bg-gray-50 transition">
          <div className="bg-orange-100 p-3 rounded-lg text-orange-600"><Package size={20}/></div>
          <div>
            <p className="text-sm text-gray-500">PO Diterbitkan</p>
            <p className="text-xl font-bold">{stats.poCount}</p>
          </div>
        </Link>
      </div>

      {/* Recent Finance Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Transaksi Keuangan Terakhir</h2>
          <Link to="/finance" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Lihat Semua</Link>
        </div>

        {recentFinance.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Belum ada transaksi</p>
        ) : (
          <div className="space-y-4">
            {recentFinance.map((t, idx) => (
              <div key={idx} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${t.type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {t.type === 'IN' ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{t.description}</p>
                    <p className="text-sm text-gray-500">{t.date}</p>
                  </div>
                </div>
                <div className={`font-semibold ${t.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'IN' ? '+' : '-'}{formatCurrency(t.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
