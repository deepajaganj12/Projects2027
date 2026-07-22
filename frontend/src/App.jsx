import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import CategoriesPage from './pages/CategoriesPage'
import CustomersPage from './pages/CustomersPage'
import InventoryPage from './pages/InventoryPage'
import POSPage from './pages/POSPage'
import OrdersPage from './pages/OrdersPage'
import PaymentsPage from './pages/PaymentsPage'
import CashBankPage from './pages/CashBankPage'
import ReportsPage from './pages/ReportsPage'
import EmployeesPage from './pages/EmployeesPage'
import SuppliersPage from './pages/SuppliersPage'
import SettingsPage from './pages/SettingsPage'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Restrict routes from ROLE_CASHIER
const AdminRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth)
  const isCashier = user?.roles?.includes('ROLE_CASHIER')
  return isCashier ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/pos" element={<POSPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/cash-bank" element={<CashBankPage />} />
        
        {/* Restricted routes */}
        <Route path="/reports" element={<AdminRoute><ReportsPage /></AdminRoute>} />
        <Route path="/suppliers" element={<AdminRoute><SuppliersPage /></AdminRoute>} />
        <Route path="/employees" element={<AdminRoute><EmployeesPage /></AdminRoute>} />
        <Route path="/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
