import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import VerifyEmail from '../features/auth/VerifyEmail';
import VerifyEmailNotice from '../features/auth/VerifyEmailNotice';
import ForgotPassword from '../features/auth/ForgotPassword';
import ResetPassword from '../features/auth/ResetPassword';
import Unauthorized from '../pages/Unauthorized';
import NotFound from '../pages/NotFound';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Customization, cart and management screens
import PizzaBuilder from '../pages/PizzaBuilder';
import Cart from '../pages/Cart';
import OrderHistory from '../pages/OrderHistory';
import AdminInventory from '../pages/AdminInventory';
import AdminOrders from '../pages/AdminOrders';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="verify-email" element={<VerifyEmail />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="unauthorized" element={<Unauthorized />} />

        {/* Verification notice requires session but bypasses verification block */}
        <Route
          path="verify-email-notice"
          element={
            <ProtectedRoute>
              <VerifyEmailNotice />
            </ProtectedRoute>
          }
        />

        {/* Protected Customer Routes */}
        <Route
          path="builder"
          element={
            <ProtectedRoute>
              <PizzaBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="admin/inventory"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/orders"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminOrders />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
