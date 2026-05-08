import React, { useState, useEffect, useRef } from 'react';
import { db, collection, getDocs, addDoc } from '../lib/db';
import { Plus, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { formatCurrency, formatDate } from '../utils/format';

export default function PurchaseOrders() {
  const [pos, setPos] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const [formData, setFormData] = useState({
    supplierId: '',
    date: new Date().toISOString().split('T')[0],
    notes: 'Mohon dikirimkan sesuai dengan spesifikasi dan waktu yang disepakati.',
    items: [{ name: '', qty: 1, price: 0 }]
  });

  const printRef = useRef();
  const handlePrint = useReactToPrint({ content: () => printRef.current });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const poSnap = await getDocs(collection(db, "purchase_orders"));
    setPos(poSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    const sSnap = await getDocs(collection(db, "suppliers"));
    setSuppliers(sSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const calculateTotal = (items) => items.reduce((sum, item) => sum + (item.qty * item.price), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const supplier = suppliers.find(s => s.id === formData.supplierId);
    const docData = {
      ...formData,
      supplierName: supplier?.name || 'Unknown',
      supplierAddress: supplier?.address || '',
      total: calculateTotal(formData.items),
      number: `PO-${Date.now()}`
    };
    await addDoc(collection(db, "purchase_orders"), docData);

    // Notice: We don't auto-record finance here. Finance Out is usually recorded when paying the invoice received from supplier.

    setIsCreating(false);
    fetchData();
  };

  const addItem = () => setFormData({ ...formData, items: [...formData.items, { name: '', qty: 1, price: 0 }] });
  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };
  const removeItem = (index) => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Purchase Order</h1>
        {!isCreating && !selectedDoc && (
          <button onClick={() => setIsCreating(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"><Plus size={20} /> Buat PO</button>
        )}
        {(isCreating || selectedDoc) && (
          <button onClick={() => { setIsCreating(false); setSelectedDoc(null); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md">Kembali</button>
        )}
      </div>

      {!isCreating && !selectedDoc && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nomor PO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Estimasi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pos.map(po => (
                <tr key={po.id}>
                  <td className="px-6 py-4">{po.number}</td>
                  <td className="px-6 py-4">{formatDate(po.date)}</td>
                  <td className="px-6 py-4">{po.supplierName}</td>
                  <td className="px-6 py-4 font-semibold">{formatCurrency(po.total)}</td>
                  <td className="px-6 py-4"><button onClick={() => setSelectedDoc(po)} className="text-blue-600 flex items-center gap-1"><Printer size={16} /> Print</button></td>
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
                <label className="block text-sm font-medium text-gray-700">Pilih Supplier</label>
                <select required value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="mt-1 block w-full border rounded-md p-2">
                  <option value="">Pilih Supplier...</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal Order</label>
                <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="mt-1 block w-full border rounded-md p-2" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Item yang Dipesan</h3>
                <button type="button" onClick={addItem} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded">Tambah Item</button>
              </div>
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2 items-start">
                  <input required placeholder="Nama Barang (Sesuai Katalog Supplier)" value={item.name} onChange={e => updateItem(index, 'name', e.target.value)} className="flex-1 border rounded p-2" />
                  <input required type="number" placeholder="Qty" value={item.qty} onChange={e => updateItem(index, 'qty', Number(e.target.value))} className="w-20 border rounded p-2" />
                  <input required type="number" placeholder="Estimasi Harga" value={item.price} onChange={e => updateItem(index, 'price', Number(e.target.value))} className="w-40 border rounded p-2" />
                  <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-600 mt-1">X</button>
                </div>
              ))}
            </div>

            <div className="text-right text-xl font-bold">Total Estimasi: {formatCurrency(calculateTotal(formData.items))}</div>

            <div className="flex justify-end gap-2 mt-6">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md">Terbitkan PO</button>
            </div>
          </form>
        </div>
      )}

      {selectedDoc && (
        <div className="bg-gray-100 p-6 rounded-lg">
          <div className="mb-4 flex justify-end"><button onClick={handlePrint} className="bg-green-600 text-white px-4 py-2 rounded flex gap-2"><Printer size={20}/> Cetak / PDF</button></div>
          <div ref={printRef} className="bg-white p-10 max-w-4xl mx-auto shadow-lg text-black print:shadow-none">

             <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
               <div>
                 <h1 className="text-3xl font-bold uppercase text-gray-900">Purchase Order</h1>
                 <p className="text-gray-600 mt-1 font-medium">Toko Komputer App</p>
                 <p className="text-gray-500 text-sm mt-2">Jl. Contoh Alamat Toko No. 123<br/>Telp: 0812-3456-7890</p>
               </div>
               <div className="text-right">
                 <div className="bg-gray-100 p-3 rounded text-left inline-block min-w-[200px]">
                    <p className="text-sm text-gray-500 uppercase tracking-wide">PO Number</p>
                    <p className="font-bold text-lg">{selectedDoc.number}</p>
                    <p className="text-sm text-gray-500 uppercase tracking-wide mt-2">PO Date</p>
                    <p className="font-bold">{formatDate(selectedDoc.date)}</p>
                 </div>
               </div>
             </div>

             <div className="mb-10">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Order To (Supplier):</h3>
                <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
                    <p className="font-bold text-lg">{selectedDoc.supplierName}</p>
                    <p className="text-gray-600">{selectedDoc.supplierAddress}</p>
                </div>
             </div>

             <table className="w-full mb-8 border-collapse">
               <thead>
                 <tr className="bg-gray-800 text-white">
                   <th className="py-2 px-4 text-left">Item Description</th>
                   <th className="py-2 px-4 text-center">Qty</th>
                   <th className="py-2 px-4 text-right">Unit Price (Est)</th>
                   <th className="py-2 px-4 text-right">Amount (Est)</th>
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
                 <tr className="font-bold text-lg">
                   <td colSpan="3" className="py-4 px-4 text-right">Grand Total:</td>
                   <td className="py-4 px-4 text-right border-t-2 border-gray-800">{formatCurrency(selectedDoc.total)}</td>
                 </tr>
               </tfoot>
             </table>

             <div className="mt-10 pt-4">
                <p className="font-bold text-gray-800">Special Instructions / Remarks:</p>
                <p className="text-gray-600 italic">{selectedDoc.notes}</p>
             </div>

             <div className="mt-16 flex justify-between">
               <div className="text-center w-48">
                 <p className="mb-20 text-gray-500">Authorized Signature</p>
                 <p className="border-t border-gray-800 pt-2 font-bold">( Purchasing Dept )</p>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
