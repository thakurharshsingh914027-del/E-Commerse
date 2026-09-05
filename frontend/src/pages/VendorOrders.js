import React, { useState, useEffect } from 'react';
import {
  HiOutlineSearch,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

const VendorOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const statusTabs = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let result = [...orders];

    if (activeFilter !== 'All') {
      result = result.filter((order) => order.status === activeFilter);
    }

    const query = searchQuery.toLowerCase().trim();
    if (query) {
      result = result.filter(
        (order) =>
          order._id?.toLowerCase().includes(query) ||
          order.user?.name?.toLowerCase().includes(query) ||
          order.customerName?.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(result);
  }, [orders, activeFilter, searchQuery]);

  const fetchOrders = async () => {
    try {
      const res = await API.get('/api/vendor/orders');
      const data = res.data.orders || res.data;
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      try {
        const res = await API.get('/api/orders');
        let data = res.data.orders || res.data;
        if (Array.isArray(data)) {
          const vendorOrders = data.filter(
            (o) =>
              o.vendor === user._id ||
              o.vendorId === user._id ||
              o.vendor?._id === user._id ||
              o.items?.some(
                (item) =>
                  item.vendor === user._id ||
                  item.vendorId === user._id ||
                  item.product?.vendor === user._id
              )
          );
          setOrders(vendorOrders);
        }
      } catch (fallbackError) {
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Inside your handleStatusUpdate function
const handleStatusChange = async (orderId, newStatus) => {
  try {
    // 1. Change Method from PUT to PATCH
    // 2. Change URL to include /api/vendor
    const res = await API.patch(`/api/vendor/orders/${orderId}/status`, { 
      status: newStatus 
    });

    if (res.data.success) {
      toast.success("Order status updated!");
      // Update your local state here...
    }
  } catch (error) {
    toast.error("Failed to update status");
    console.error(error);
  }
};

  const toggleExpand = (orderId) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Processing':
        return 'status-badge status-processing';
      case 'Shipped':
        return 'status-badge status-shipped';
      case 'Delivered':
        return 'status-badge status-delivered';
      case 'Cancelled':
        return 'status-badge status-cancelled';
      default:
        return 'status-badge status-processing';
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="Vendor" activePage="Orders">
        <div className="loading-spinner-container">
          <div className="loading-spinner" />
          <p>Loading orders...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="Vendor" activePage="Orders">
      <div className="vendor-orders">
        <div className="page-header">
          <div>
            <h1>Orders</h1>
            <p className="text-muted">
              {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}{' '}
              {activeFilter !== 'All' ? `in ${activeFilter}` : 'total'}
            </p>
          </div>
        </div>

        <div className="search-bar">
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by Order ID or Customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-tabs">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              className={`filter-tab ${activeFilter === tab ? 'filter-tab-active' : ''}`}
              onClick={() => setActiveFilter(tab)}
            >
              {tab}
              <span className="filter-count">
                {tab === 'All'
                  ? orders.length
                  : orders.filter((o) => o.status === tab).length}
              </span>
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <HiOutlineSearch className="empty-icon" />
            <h3>No orders found</h3>
            <p>
              {activeFilter !== 'All'
                ? `No ${activeFilter.toLowerCase()} orders at the moment.`
                : 'Orders will appear here once customers make purchases.'}
            </p>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order._id} className="order-card">
                <div
                  className="order-header"
                  onClick={() => toggleExpand(order._id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && toggleExpand(order._id)}
                >
                  <div className="order-header-left">
                    <span className="order-id font-mono">
                      #{order._id?.slice(-8) || 'N/A'}
                    </span>
                    <span className="order-customer">
                      {order.user?.name || order.customerName || 'Customer'}
                    </span>
                    <span className="order-date text-muted">
                      {formatDate(order.createdAt || order.orderDate)}
                    </span>
                  </div>
                  <div className="order-header-right">
                    <span className="order-items-count text-muted">
                      {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                    </span>
                    <span className="order-total font-semibold">
                      {formatCurrency(order.totalAmount || order.total || 0)}
                    </span>
                    <span className={getStatusBadgeClass(order.status)}>
                      {order.status || 'Processing'}
                    </span>
                    {expandedOrder === order._id ? (
                      <HiOutlineChevronUp className="expand-icon" />
                    ) : (
                      <HiOutlineChevronDown className="expand-icon" />
                    )}
                  </div>
                </div>

                <div className="order-status-row">
                  <label className="status-label">Update Status:</label>
                  <select
                    className="status-select"
                    value={order.status || 'Processing'}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    disabled={updatingStatus === order._id}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  {updatingStatus === order._id && (
                    <span className="updating-text">Updating...</span>
                  )}
                </div>

                {expandedOrder === order._id && order.items?.length > 0 && (
                  <div className="order-items-expanded">
                    <table className="items-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Price</th>
                          <th>Qty</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <div className="item-product">
                                {item.product?.images?.[0] && (
                                  <img
                                    src={item.product.images[0]}
                                    alt={item.product?.name || item.name}
                                    className="item-image"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                )}
                                <span>{item.product?.name || item.name || 'Product'}</span>
                              </div>
                            </td>
                            <td className="text-muted">{formatCurrency(item.price || 0)}</td>
                            <td>{item.quantity || 1}</td>
                            <td className="font-semibold">
                              {formatCurrency((item.price || 0) * (item.quantity || 1))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .vendor-orders { max-width: 1200px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
        .page-header h1 { font-size: 1.75rem; font-weight: 700; margin: 0; color: #1a1a2e; }
        .page-header .text-muted { margin: 0.25rem 0 0; color: #6b7280; font-size: 0.9rem; }
        .search-bar { display: flex; align-items: center; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 0 1rem; margin-bottom: 1rem; transition: border-color 0.2s; }
        .search-bar:focus-within { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
        .search-icon { width: 20px; height: 20px; color: #9ca3af; flex-shrink: 0; }
        .search-input { flex: 1; border: none; outline: none; padding: 0.75rem 0.75rem; font-size: 0.9rem; background: transparent; }
        .filter-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .filter-tab { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 9999px; border: 1px solid #e5e7eb; background: #fff; font-size: 0.85rem; font-weight: 500; color: #374151; cursor: pointer; transition: all 0.2s; }
        .filter-tab:hover { border-color: #6366f1; color: #6366f1; }
        .filter-tab-active { background: #6366f1; color: #fff; border-color: #6366f1; }
        .filter-tab-active:hover { background: #4f46e5; color: #fff; }
        .filter-count { background: rgba(0,0,0,0.08); padding: 0.1rem 0.45rem; border-radius: 9999px; font-size: 0.75rem; }
        .filter-tab-active .filter-count { background: rgba(255,255,255,0.2); }
        .orders-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .order-card { background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border: 1px solid #f0f0f0; overflow: hidden; transition: box-shadow 0.2s; }
        .order-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .order-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; cursor: pointer; gap: 1rem; flex-wrap: wrap; }
        .order-header-left { display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap; }
        .order-header-right { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .order-id { font-size: 0.85rem; font-weight: 600; color: #6366f1; }
        .order-customer { font-weight: 500; color: #1a1a2e; }
        .order-date { font-size: 0.85rem; }
        .order-items-count { font-size: 0.85rem; }
        .order-total { font-size: 1rem; color: #1a1a2e; }
        .expand-icon { width: 18px; height: 18px; color: #6b7280; }
        .font-mono { font-family: monospace; }
        .font-semibold { font-weight: 600; }
        .text-muted { color: #6b7280; }
        .status-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap; }
        .status-processing { background: #f59e0b; color: #fff; }
        .status-shipped { background: #3b82f6; color: #fff; }
        .status-delivered { background: #10b981; color: #fff; }
        .status-cancelled { background: #ef4444; color: #fff; }
        .order-status-row { display: flex; align-items: center; gap: 0.75rem; padding: 0 1.25rem 0.75rem; border-top: 1px solid #f0f0f0; }
        .status-label { font-size: 0.8rem; color: #6b7280; white-space: nowrap; }
        .status-select { padding: 0.35rem 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.85rem; color: #374151; background: #fff; cursor: pointer; outline: none; transition: border-color 0.2s; }
        .status-select:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
        .status-select:disabled { opacity: 0.6; cursor: not-allowed; }
        .updating-text { font-size: 0.8rem; color: #6366f1; font-style: italic; }
        .order-items-expanded { border-top: 1px solid #f0f0f0; padding: 0.75rem 1.25rem 1rem; }
        .items-table { width: 100%; border-collapse: collapse; }
        .items-table th, .items-table td { padding: 0.5rem 0.75rem; text-align: left; font-size: 0.85rem; }
        .items-table th { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; font-weight: 600; border-bottom: 1px solid #f0f0f0; }
        .item-product { display: flex; align-items: center; gap: 0.75rem; }
        .item-image { width: 36px; height: 36px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
        .empty-state { text-align: center; padding: 3rem 1rem; background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border: 1px solid #f0f0f0; color: #6b7280; }
        .empty-icon { width: 48px; height: 48px; margin: 0 auto 1rem; color: #d1d5db; }
        .empty-state h3 { margin: 0 0 0.5rem; color: #374151; }
        .empty-state p { margin: 0; font-size: 0.9rem; }
        .loading-spinner-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; color: #6b7280; }
        .loading-spinner { width: 40px; height: 40px; border: 3px solid #e5e7eb; border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 1rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .order-header { flex-direction: column; align-items: flex-start; }
          .order-header-left, .order-header-right { width: 100%; }
          .filter-tabs { gap: 0.35rem; }
          .filter-tab { padding: 0.4rem 0.75rem; font-size: 0.8rem; }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default VendorOrders;
