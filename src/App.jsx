import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

function App() {
  return (
    <AuthProvider>
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
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
