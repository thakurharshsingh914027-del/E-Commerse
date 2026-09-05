import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import ChatbotWidget from './components/ChatbotWidget';
import PrivateRoute from './components/PrivateRoute';
import Loader from './components/Loader';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
// Pages
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AuthPage from './pages/AuthPage';
import MyOrdersPage from './pages/MyOrdersPage';
import WishlistPage from './pages/WishlistPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';
import VendorDashboard from './pages/VendorDashboard';
import VendorProducts from './pages/VendorProducts';
import VendorOrders from './pages/VendorOrders';
import VendorAddProduct from './pages/VendorAddProduct';
import NotFoundPage from './pages/NotFoundPage';
import AdminAnalytics from './pages/AdminAnalytics';
function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('shopmart_theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('shopmart_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className="app">
      <Navbar darkMode={darkMode} onToggleDarkMode={() => setDarkMode((current) => !current)} />
      <main>
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            {/* Private Routes - Customer */}
            <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><MyOrdersPage /></PrivateRoute>} />
            <Route path="/wishlist" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
            <Route path="/admin/products" element={<PrivateRoute role="Admin"><AdminProducts /></PrivateRoute>} />
            <Route path="/admin/orders" element={<PrivateRoute role="Admin"><AdminOrders /></PrivateRoute>} />
            <Route path="/admin/users" element={<PrivateRoute role="Admin"><AdminUsers /></PrivateRoute>} />
            <Route path="/admin/analytics" element={<PrivateRoute role="Admin"><AdminAnalytics /></PrivateRoute>} />
            {/* Vendor Routes */}
           <Route path="/vendor/dashboard" element={<PrivateRoute role="vendor"><VendorDashboard /></PrivateRoute>} />
            <Route path="/vendor/products" element={<PrivateRoute role="Vendor"><VendorProducts /></PrivateRoute>} />
            <Route path="/vendor/orders" element={<PrivateRoute role="Vendor"><VendorOrders /></PrivateRoute>} />
            <Route path="/vendor/add-product" element={<PrivateRoute role="Vendor"><VendorAddProduct /></PrivateRoute>} />
            <Route path="/vendor/edit-product/:id" element={<PrivateRoute role="Vendor"><VendorAddProduct /></PrivateRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <CartSidebar />
      <ChatbotWidget />
    </div>
  );
}

export default App;
