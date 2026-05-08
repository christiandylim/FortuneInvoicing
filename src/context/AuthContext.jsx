import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, collection, getDocs, addDoc } from '../lib/db';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Check for stored session
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      // Seed default admin if no users exist
      const usersSnap = await getDocs(collection(db, "users"));
      if (usersSnap.docs.length === 0) {
        await addDoc(collection(db, "users"), {
          username: 'admin',
          password: 'admin',
          role: 'admin',
          name: 'Andry'
        });
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username, password) => {
    const usersSnap = await getDocs(collection(db, "users"));
    const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const foundUser = users.find(u => u.username === username && u.password === password);

    if (foundUser) {
      const userData = { id: foundUser.id, username: foundUser.username, role: foundUser.role, name: foundUser.name };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
