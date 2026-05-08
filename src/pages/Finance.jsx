import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, addDoc, deleteDoc, doc } from '../lib/db';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, X } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';

export default function Finance() {
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'IN',
    description: '',
    amount: ''
  });

  const fetchTransactions = async () => {
    const querySnapshot = await getDocs(collection(db, "finance"));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort descending by date
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    setTransactions(data);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "finance"), {
      ...formData,
      amount: Number(formData.amount)
    });
    setFormData({ date: new Date().toISOString().split('T')[0], type: 'IN', description: '', amount: '' });
    setIsModalOpen(false);
    fetchTransactions();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus pencatatan ini?')) {
      await deleteDoc(doc(db, "finance", id));
      fetchTransactions();
    }
  };

  const totalIn = transactions.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'OUT').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIn - totalOut;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Pencatatan Keuangan</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2">
          <Plus size={20} /> Catat Transaksi Baru
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-500">Total Pemasukan</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(totalIn)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <p className="text-sm font-medium text-gray-500">Total Pengeluaran</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(totalOut)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-500">Saldo Saat Ini</p>
          <p className={`mt-2 text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Jumlah</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">Belum ada transaksi</td></tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(t.date)}</td>
                  <td className="px-6 py-4">{t.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {t.type === 'IN' ?
                      <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium"><ArrowDownRight size={14}/> Pemasukan</span> :
                      <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium"><ArrowUpRight size={14}/> Pengeluaran</span>
                    }
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right font-medium ${t.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'IN' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Catat Transaksi</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                <input required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Jenis Transaksi</label>
                <select required value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                  <option value="IN">Pemasukan (Uang Masuk)</option>
                  <option value="OUT">Pengeluaran (Uang Keluar)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Deskripsi / Keterangan</label>
                <input required type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Contoh: Bayar Listrik, Beli Sparepart" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Jumlah (Rp)</label>
                <input required type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-white py-2 px-4 border rounded-md text-gray-700">Batal</button>
                <button type="submit" className="bg-blue-600 py-2 px-4 border border-transparent rounded-md text-white">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
