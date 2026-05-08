import React, { useState, useEffect, useRef } from 'react';
import { db, collection, getDocs, addDoc } from '../lib/db';
import { Plus, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { formatCurrency, formatDate } from '../utils/format';

export default function Quotations() {
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const [formData, setFormData] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    validUntil: '',
    notes: 'Harga sewaktu-waktu dapat berubah tanpa pemberitahuan sebelumnya.',
    items: [{ name: '', qty: 1, price: 0 }]
  });

  const printRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const qSnap = await getDocs(collection(db, "quotations"));
    setQuotations(qSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    const cSnap = await getDocs(collection(db, "customers"));
    setCustomers(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const calculateTotal = (items) => items.reduce((sum, item) => sum + (item.qty * item.price), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === formData.customerId);
    const docData = {
      ...formData,
      customerName: customer?.name || 'Unknown',
      total: calculateTotal(formData.items),
      number: `QUO-${Date.now()}`
    };
    await addDoc(collection(db, "quotations"), docData);
    setIsCreating(false);
    fetchData();
  };

  const addItem = () => setFormData({ ...formData, items: [...formData.items, { name: '', qty: 1, price: 0 }] });

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Surat Penawaran</h1>
        {!isCreating && !selectedDoc && (
          <button onClick={() => setIsCreating(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
            <Plus size={20} /> Buat Penawaran
          </button>
        )}
        {(isCreating || selectedDoc) && (
          <button onClick={() => { setIsCreating(false); setSelectedDoc(null); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md">
            Kembali
          </button>
        )}
      </div>

      {!isCreating && !selectedDoc && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nomor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quotations.map(q => (
                <tr key={q.id}>
                  <td className="px-6 py-4">{q.number}</td>
                  <td className="px-6 py-4">{formatDate(q.date)}</td>
                  <td className="px-6 py-4">{q.customerName}</td>
                  <td className="px-6 py-4 font-semibold">{formatCurrency(q.total)}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => setSelectedDoc(q)} className="text-blue-600 flex items-center gap-1">
                      <Printer size={16} /> Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isCreating && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer</label>
                <select required value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} className="mt-1 block w-full border rounded-md p-2">
                  <option value="">Pilih Customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="mt-1 block w-full border rounded-md p-2" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Item List</h3>
                <button type="button" onClick={addItem} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded">Tambah Item</button>
              </div>
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2 items-start">
                  <input required placeholder="Nama Barang/Jasa" value={item.name} onChange={e => updateItem(index, 'name', e.target.value)} className="flex-1 border rounded p-2" />
                  <input required type="number" placeholder="Qty" value={item.qty} onChange={e => updateItem(index, 'qty', Number(e.target.value))} className="w-20 border rounded p-2" />
                  <input required type="number" placeholder="Harga Satuan" value={item.price} onChange={e => updateItem(index, 'price', Number(e.target.value))} className="w-40 border rounded p-2" />
                  <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-600 mt-1">X</button>
                </div>
              ))}
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700">Catatan Tambahan</label>
               <textarea rows="2" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="mt-1 block w-full border rounded-md p-2"></textarea>
            </div>

            <div className="text-right text-xl font-bold">
              Total: {formatCurrency(calculateTotal(formData.items))}
            </div>

            <div className="flex justify-end gap-2">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {selectedDoc && (
        <div className="bg-gray-100 p-6 rounded-lg">
          <div className="mb-4 flex justify-end">
             <button onClick={handlePrint} className="bg-green-600 text-white px-4 py-2 rounded flex gap-2"><Printer size={20}/> Cetak / PDF</button>
          </div>
          <div ref={printRef} className="bg-white p-10 max-w-4xl mx-auto shadow-lg text-black print:shadow-none">
             <div className="border-b-2 border-gray-800 pb-4 mb-6 text-center">
               <h1 className="text-3xl font-bold uppercase tracking-wider">Surat Penawaran</h1>
               <p className="text-gray-600 mt-1">Toko Komputer App - Solusi IT Terbaik</p>
             </div>

             <div className="flex justify-between mb-8">
                <div>
                  <p className="text-sm text-gray-500">Kepada Yth:</p>
                  <p className="font-bold text-lg">{selectedDoc.customerName}</p>
                </div>
                <div className="text-right">
                  <p><span className="font-semibold">No:</span> {selectedDoc.number}</p>
                  <p><span className="font-semibold">Tanggal:</span> {formatDate(selectedDoc.date)}</p>
                </div>
             </div>

             <table className="w-full mb-8 border-collapse">
               <thead>
                 <tr className="bg-gray-100 border-y border-gray-300">
                   <th className="py-2 px-4 text-left">Deskripsi</th>
                   <th className="py-2 px-4 text-center">Qty</th>
                   <th className="py-2 px-4 text-right">Harga Satuan</th>
                   <th className="py-2 px-4 text-right">Subtotal</th>
                 </tr>
               </thead>
               <tbody>
                 {selectedDoc.items.map((it, idx) => (
                   <tr key={idx} className="border-b border-gray-200">
                     <td className="py-3 px-4">{it.name}</td>
                     <td className="py-3 px-4 text-center">{it.qty}</td>
                     <td className="py-3 px-4 text-right">{formatCurrency(it.price)}</td>
                     <td className="py-3 px-4 text-right">{formatCurrency(it.qty * it.price)}</td>
                   </tr>
                 ))}
               </tbody>
               <tfoot>
                 <tr className="font-bold text-lg bg-gray-50 border-b border-gray-300">
                   <td colSpan="3" className="py-3 px-4 text-right">Total:</td>
                   <td className="py-3 px-4 text-right">{formatCurrency(selectedDoc.total)}</td>
                 </tr>
               </tfoot>
             </table>

             <div className="mt-8 pt-4 border-t border-gray-300">
                <p className="font-semibold">Catatan:</p>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedDoc.notes}</p>
             </div>

             <div className="mt-16 flex justify-end">
               <div className="text-center w-48">
                 <p className="mb-16">Hormat Kami,</p>
                 <p className="border-t border-gray-400 pt-1">( Admin )</p>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
