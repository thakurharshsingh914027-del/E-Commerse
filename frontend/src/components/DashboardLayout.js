import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiChartBar,
  HiCube,
  HiClipboardList,
  HiUsers,
  HiPlus,
  HiMenu,
  HiX,
  HiHome,
  HiLogout,
  HiUser,
} from 'react-icons/hi';

const DashboardLayout = ({ children, role, activePage }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const adminNavItems = [
    { label: 'Dashboard', icon: <HiChartBar />, path: '/admin' },
    { label: 'Products', icon: <HiCube />, path: '/admin/products' },
    { label: 'Orders', icon: <HiClipboardList />, path: '/admin/orders' },
    { label: 'Users', icon: <HiUsers />, path: '/admin/users' },
  ];

  const vendorNavItems = [
    { label: 'Dashboard', icon: <HiChartBar />, path: '/vendor/dashboard' },
    { label: 'Products', icon: <HiCube />, path: '/vendor/products' },
    { label: 'Add Product', icon: <HiPlus />, path: '/vendor/add-product' },
    { label: 'Orders', icon: <HiClipboardList />, path: '/vendor/orders' },
  ];

  const navItems = role === 'Admin' ? adminNavItems : vendorNavItems;

  const isActive = (path) => {
    if (path === '/admin' || path === '/vendor/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getTitle = () => {
    const item = navItems.find(
      (item) => item.path === activePage || isActive(item.path)
    );
    return item?.label || activePage || 'Dashboard';
  };

  return (
    <div className="dashboard">
      {/* Mobile sidebar toggle */}
      <button
        className="btn btn-icon"
        style={{
          position: 'fixed',
          top: '80px',
          left: '16px',
          zIndex: '1001',
          display: window.innerWidth <= 768 ? 'flex' : 'none',
        }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <HiX /> : <HiMenu />}
      </button>

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div className="dashboard-sidebar-header">
          <h3>
            {role === 'Admin' ? '🛡️' : '🏪'} {role} Panel
          </h3>
        </div>
        <nav className="dashboard-sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`dashboard-nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
          <div style={{ height: '1px', background: '#E9ECEF', margin: '12px 0' }} />
          <button
            className="dashboard-nav-item"
            onClick={() => {
              navigate('/');
              setSidebarOpen(false);
            }}
          >
            <HiHome /> Back to Store
          </button>
          <button className="dashboard-nav-item" onClick={handleLogout}>
            <HiLogout /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>{getTitle()}</h1>
          <div className="dashboard-header-actions">
            <Link to="/" className="btn btn-outline btn-sm">
              <HiHome /> Visit Store
            </Link>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
