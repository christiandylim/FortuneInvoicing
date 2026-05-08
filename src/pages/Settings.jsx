import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Settings as SettingsIcon, Save, Image as ImageIcon, X } from 'lucide-react';

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState({
    storeName: '',
    subtitle: '',
    senderName: '',
    logoBase64: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        storeName: settings.storeName || '',
        subtitle: settings.subtitle || '',
        senderName: settings.senderName || '',
        logoBase64: settings.logoBase64 || ''
      });
    }
  }, [settings]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logoBase64: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await updateSettings(formData);
    setTimeout(() => setIsSaving(false), 500); // Visual feedback
    alert("Pengaturan berhasil disimpan!");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="text-gray-900" size={28} />
        <h1 className="text-2xl font-semibold text-gray-900">Pengaturan Aplikasi</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Detail Toko & Surat</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Toko</label>
                <input required type="text" value={formData.storeName} onChange={(e) => setFormData({...formData, storeName: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                <p className="mt-1 text-xs text-gray-500">Akan tampil di header utama dokumen dan sidebar.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Alamat / Subtitle</label>
                <input required type="text" value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                <p className="mt-1 text-xs text-gray-500">Akan tampil di bawah nama toko pada header dokumen.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Pengirim Default</label>
                <input required type="text" value={formData.senderName} onChange={(e) => setFormData({...formData, senderName: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                <p className="mt-1 text-xs text-gray-500">Nama yang muncul di bagian tanda tangan (Hormat Kami).</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Logo Toko</h2>

              <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                {formData.logoBase64 ? (
                  <div className="relative">
                    <img src={formData.logoBase64} alt="Logo Toko" className="max-h-32 object-contain mb-4" />
                    <button type="button" onClick={() => setFormData({...formData, logoBase64: ''})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-400 mb-4">
                    <ImageIcon size={48} />
                  </div>
                )}

                <label className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <span>{formData.logoBase64 ? 'Ganti Logo' : 'Upload Logo'}</span>
                  <input type="file" className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={handleImageUpload} />
                </label>
                <p className="mt-2 text-xs text-gray-500">Format yang didukung: JPG, PNG. Ukuran ideal 300x100px.</p>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t">
            <div className="flex justify-end">
              <button disabled={isSaving} type="submit" className="flex items-center gap-2 bg-blue-600 py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                <Save size={18} />
                {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
