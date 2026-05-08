import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MasterCustomer from './pages/MasterCustomer';
import MasterSupplier from './pages/MasterSupplier';
import Quotations from './pages/Quotations';
import Invoices from './pages/Invoices';
import PurchaseOrders from './pages/PurchaseOrders';
import Finance from './pages/Finance';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';

// Component to protect admin routes
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<MasterCustomer />} />
          <Route path="suppliers" element={<MasterSupplier />} />
          <Route path="quotations" element={<Quotations />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="purchase-orders" element={<PurchaseOrders />} />
          <Route path="finance" element={<Finance />} />

          {/* Admin Only Routes */}
          <Route path="settings" element={
            <AdminRoute>
              <Settings />
            </AdminRoute>
          } />
          <Route path="users" element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
         <AppContent />
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
