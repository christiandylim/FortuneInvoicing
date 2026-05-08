import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, collection, getDocs, addDoc, updateDoc, doc } from '../lib/db';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    id: null,
    storeName: 'Fortune Star Computer',
    subtitle: 'Harco Mangga Dua Lt. 2',
    senderName: 'Andry',
    logoBase64: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    const snap = await getDocs(collection(db, "settings"));
    if (snap.docs.length > 0) {
      const data = snap.docs[0].data();
      setSettings({ id: snap.docs[0].id, ...data });
    } else {
      // Create default settings if not exists
      const defaultSettings = {
        storeName: 'Fortune Star Computer',
        subtitle: 'Harco Mangga Dua Lt. 2',
        senderName: 'Andry',
        logoBase64: ''
      };
      const docRef = await addDoc(collection(db, "settings"), defaultSettings);
      setSettings({ id: docRef.id, ...defaultSettings });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings) => {
    if (settings.id) {
      await updateDoc(doc(db, "settings", settings.id), newSettings);
      setSettings({ ...settings, ...newSettings });
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, fetchSettings }}>
      {!loading && children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
