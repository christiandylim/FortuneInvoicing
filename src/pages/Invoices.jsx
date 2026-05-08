import React, { useState, useEffect, useRef } from 'react';
import { db, collection, getDocs, addDoc } from '../lib/db';
import { Plus, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { formatCurrency, formatDate } from '../utils/format';
import { useSettings } from '../context/SettingsContext';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const { settings } = useSettings();

  const [formData, setFormData] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    discount: 0,
    downPayment: 0,
    notes: 'Terima kasih atas kepercayaan Anda.',
    items: [{ name: '', qty: 1, price: 0 }]
  });

  const printRef = useRef();
  const handlePrint = useReactToPrint({ content: () => printRef.current });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const iSnap = await getDocs(collection(db, "invoices"));
    setInvoices(iSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    const cSnap = await getDocs(collection(db, "customers"));
    setCustomers(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const calculateSubtotal = (items) => items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const calculateGrandTotal = (subtotal, discount, dp) => subtotal - discount - dp;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === formData.customerId);
    const subtotal = calculateSubtotal(formData.items);
    const docData = {
      ...formData,
      customerName: customer?.name || 'Unknown',
      subtotal,
      total: calculateGrandTotal(subtotal, formData.discount, formData.downPayment),
      number: `INV-${Date.now()}`
    };
    await addDoc(collection(db, "invoices"), docData);

    // Automatically record to finance if there's a payment (DP or full)
    const paidAmount = formData.downPayment > 0 ? formData.downPayment : docData.total;
    if (paidAmount > 0) {
      await addDoc(collection(db, "finance"), {
        date: formData.date,
        type: 'IN',
        description: `Pembayaran ${formData.downPayment > 0 ? 'DP ' : ''}Invoice ${docData.number} - ${customer?.name}`,
        amount: paidAmount
      });
    }

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

  const currentSubtotal = calculateSubtotal(formData.items);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Invoice</h1>
        {!isCreating && !selectedDoc && (
          <button onClick={() => setIsCreating(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"><Plus size={20} /> Buat Invoice</button>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nomor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Akhir</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map(i => (
                <tr key={i.id}>
                  <td className="px-6 py-4">{i.number}</td>
                  <td className="px-6 py-4">{formatDate(i.date)}</td>
                  <td className="px-6 py-4">{i.customerName}</td>
                  <td className="px-6 py-4 font-semibold">{formatCurrency(i.total)}</td>
                  <td className="px-6 py-4"><button onClick={() => setSelectedDoc(i)} className="text-blue-600 flex items-center gap-1"><Printer size={16} /> Print</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isCreating && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
             {/* Form Inputs (Same as previous) */}
             <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer</label>
                <select required value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} className="mt-1 block w-full border rounded-md p-2">
                  <option value="">Pilih Customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal Invoice</label>
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
                  <input required type="number" placeholder="Harga" value={item.price} onChange={e => updateItem(index, 'price', Number(e.target.value))} className="w-40 border rounded p-2" />
                  <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-600 mt-1">X</button>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 w-1/2 ml-auto space-y-3">
               <div className="flex justify-between"><span>Subtotal:</span> <span>{formatCurrency(currentSubtotal)}</span></div>
               <div className="flex justify-between items-center">
                 <span>Diskon (Rp):</span>
                 <input type="number" value={formData.discount} onChange={e => setFormData({...formData, discount: Number(e.target.value)})} className="w-40 border rounded p-1 text-right" />
               </div>
               <div className="flex justify-between items-center">
                 <span>Down Payment (DP):</span>
                 <input type="number" value={formData.downPayment} onChange={e => setFormData({...formData, downPayment: Number(e.target.value)})} className="w-40 border rounded p-1 text-right" />
               </div>
               <div className="flex justify-between text-xl font-bold border-t pt-2">
                 <span>Sisa Bayar / Total:</span>
                 <span>{formatCurrency(calculateGrandTotal(currentSubtotal, formData.discount, formData.downPayment))}</span>
               </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md">Simpan Invoice</button>
            </div>
          </form>
        </div>
      )}

      {selectedDoc && (
        <div className="bg-gray-100 p-6 rounded-lg">
          <div className="mb-4 flex justify-end"><button onClick={handlePrint} className="bg-green-600 text-white px-4 py-2 rounded flex gap-2"><Printer size={20}/> Cetak / PDF</button></div>
          <div ref={printRef} className="bg-white p-10 max-w-4xl mx-auto shadow-lg text-black print:shadow-none print:p-0">

             <div className="border-b-2 border-blue-800 pb-4 mb-6 flex justify-between items-end">
               <div className="flex items-center gap-4">
                 {settings.logoBase64 && (
                    <img src={settings.logoBase64} alt="Logo" className="max-h-20 object-contain" />
                 )}
                 <div>
                   <h1 className="text-3xl font-extrabold text-blue-900 uppercase tracking-wide">{settings.storeName}</h1>
                   <p className="text-gray-600 mt-1 font-medium">{settings.subtitle}</p>
                 </div>
               </div>
               <div className="text-right">
                 <h2 className="text-4xl font-black text-gray-200 uppercase tracking-widest mb-2">INVOICE</h2>
                 <p className="text-xl font-semibold text-gray-800">{selectedDoc.number}</p>
                 <p className="text-gray-500">Tanggal: {formatDate(selectedDoc.date)}</p>
               </div>
             </div>

             <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Tagihan Untuk:</p>
                <p className="font-bold text-xl text-gray-800">{selectedDoc.customerName}</p>
             </div>

             <table className="w-full mb-8 border-collapse">
               <thead>
                 <tr className="bg-blue-900 text-white print:bg-blue-900 print:text-black">
                   <th className="py-3 px-4 text-left rounded-tl-lg">Deskripsi Item</th>
                   <th className="py-3 px-4 text-center">Qty</th>
                   <th className="py-3 px-4 text-right">Harga Satuan</th>
                   <th className="py-3 px-4 text-right rounded-tr-lg">Jumlah</th>
                 </tr>
               </thead>
               <tbody>
                 {selectedDoc.items.map((it, idx) => (
                   <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                     <td className="py-3 px-4">{it.name}</td>
                     <td className="py-3 px-4 text-center">{it.qty}</td>
                     <td className="py-3 px-4 text-right">{formatCurrency(it.price)}</td>
                     <td className="py-3 px-4 text-right font-medium">{formatCurrency(it.qty * it.price)}</td>
                   </tr>
                 ))}
               </tbody>
             </table>

             <div className="flex justify-end mb-8">
               <div className="w-80 space-y-2">
                  <div className="flex justify-between text-gray-600"><span>Subtotal:</span> <span>{formatCurrency(selectedDoc.subtotal)}</span></div>
                  {selectedDoc.discount > 0 && <div className="flex justify-between text-red-500"><span>Diskon:</span> <span>-{formatCurrency(selectedDoc.discount)}</span></div>}
                  {selectedDoc.downPayment > 0 && <div className="flex justify-between text-green-600"><span>Telah Dibayar (DP):</span> <span>-{formatCurrency(selectedDoc.downPayment)}</span></div>}
                  <div className="flex justify-between text-2xl font-bold text-blue-900 border-t-2 border-blue-900 pt-2 mt-2">
                    <span>Total Tagihan:</span> <span>{formatCurrency(selectedDoc.total)}</span>
                  </div>
               </div>
             </div>

             <div className="mt-8 border-l-4 border-blue-500 pl-4 py-2 bg-gray-50">
                <p className="font-semibold text-gray-800">Catatan:</p>
                <p className="text-gray-600">{selectedDoc.notes}</p>
             </div>

             <div className="mt-16 flex justify-end">
               <div className="text-center w-48">
                 <p className="mb-16">Hormat Kami,</p>
                 <p className="border-t border-gray-400 pt-1 font-semibold">( {settings.senderName} )</p>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
