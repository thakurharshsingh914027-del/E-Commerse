import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineCube, HiOutlineTruck, HiOutlineCheckCircle, HiOutlineCurrencyRupee } from 'react-icons/hi';
import toast from 'react-hot-toast';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeOrders: 0,
    completedOrders: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Updated endpoints to match backend router mounting
        const [statsRes, ordersRes] = await Promise.all([
          API.get('/api/vendor/stats'),
          API.get('/api/vendor/orders'),
        ]);

        setStats({
          totalProducts: statsRes.data.totalProducts || 0,
          activeOrders: statsRes.data.activeOrders || 0,
          completedOrders: statsRes.data.completedOrders || 0,
          revenue: statsRes.data.revenue || 0,
        });

        // Slice to show only top 5 recent orders
        const allOrders = ordersRes.data || [];
        setRecentOrders(Array.isArray(allOrders) ? allOrders.slice(0, 5) : []);
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
      case 'Processing': return 'status-badge status-processing';
      case 'Shipped': return 'status-badge status-shipped';
      case 'Delivered': return 'status-badge status-delivered';
      case 'Cancelled': return 'status-badge status-cancelled';
      default: return 'status-badge status-processing';
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="Vendor" activePage="Dashboard">
        <div className="loading-spinner-container">
          <div className="loading-spinner" />
          <p>Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="Vendor" activePage="Dashboard">
      <div className="vendor-dashboard">
        <div className="dashboard-welcome">
          <div>
            <h1>Welcome back, {user?.name || 'Vendor'}!</h1>
            <p className="text-muted">
              Manage your store — <strong>{user?.storeName || 'My Store'}</strong>
            </p>
          </div>
          <div className="quick-actions">
            <Link to="/vendor/add-product" className="btn btn-primary">
              + Add New Product
            </Link>
            <Link to="/vendor/products" className="btn btn-outline">
              View All Products
            </Link>
          </div>
        </div>

        <div className="stat-cards">
          <div className="stat-card">
            <div className="stat-card-icon" style={{ backgroundColor: '#6366f1' }}>
              <HiOutlineCube className="stat-icon" />
            </div>
            <div className="stat-card-info">
              <span className="stat-card-title">Total Products</span>
              <span className="stat-card-value">{stats.totalProducts}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ backgroundColor: '#f59e0b' }}>
              <HiOutlineTruck className="stat-icon" />
            </div>
            <div className="stat-card-info">
              <span className="stat-card-title">Active Orders</span>
              <span className="stat-card-value">{stats.activeOrders}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ backgroundColor: '#10b981' }}>
              <HiOutlineCheckCircle className="stat-icon" />
            </div>
            <div className="stat-card-info">
              <span className="stat-card-title">Completed Orders</span>
              <span className="stat-card-value">{stats.completedOrders}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ backgroundColor: '#ec4899' }}>
              <HiOutlineCurrencyRupee className="stat-icon" />
            </div>
            <div className="stat-card-info">
              <span className="stat-card-title">Revenue</span>
              <span className="stat-card-value">{formatCurrency(stats.revenue)}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <Link to="/vendor/orders" className="view-all-link">View All →</Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="empty-state">
              <HiOutlineTruck className="empty-icon" />
              <h3>No orders yet</h3>
              <p>Orders will appear here once customers purchase your products.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Your Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    // Calculate vendor-specific stats for this order row
                    let vendorTotal = 0;
                    let vendorStatus = "Processing";

                    order.items?.forEach(item => {
                      // Handle both populated and ID-only vendor fields
                      const itemVendorId = item.vendor?._id || item.vendor;
                      if (itemVendorId?.toString() === user?._id?.toString()) {
                        vendorTotal += item.price * item.quantity;
                        vendorStatus = item.status; 
                      }
                    });

                    return (
                      <tr key={order._id}>
                        <td className="font-mono">#{order._id?.slice(-8)}</td>
                        <td>{order.user?.name || 'Guest'}</td>
                        <td className="font-semibold">{formatCurrency(vendorTotal)}</td>
                        <td>
                          <span className={getStatusBadgeClass(vendorStatus)}>
                            {vendorStatus}
                          </span>
                        </td>
                        <td className="text-muted">{formatDate(order.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .vendor-dashboard { max-width: 1200px; padding: 1rem; }
        .dashboard-welcome { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .dashboard-welcome h1 { font-size: 1.75rem; font-weight: 700; margin: 0; color: #1a1a2e; }
        .text-muted { color: #6b7280; font-size: 0.9rem; }
        .quick-actions { display: flex; gap: 0.75rem; }
        .stat-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }
        .stat-card { background: #fff; border-radius: 12px; padding: 1.5rem; display: flex; align-items: center; gap: 1rem; border: 1px solid #f0f0f0; transition: all 0.2s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .stat-card-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .stat-icon { font-size: 1.5rem; color: #fff; }
        .stat-card-info { display: flex; flex-direction: column; }
        .stat-card-title { font-size: 0.85rem; color: #6b7280; text-transform: uppercase; }
        .stat-card-value { font-size: 1.5rem; font-weight: 700; color: #111827; }
        .dashboard-section { background: #fff; border-radius: 12px; padding: 1.5rem; border: 1px solid #f0f0f0; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { background: #f9fafb; padding: 12px; text-align: left; font-size: 0.75rem; color: #4b5563; text-transform: uppercase; }
        .data-table td { padding: 14px 12px; border-bottom: 1px solid #f3f4f6; font-size: 0.95rem; }
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
        .status-processing { background: #fef3c7; color: #92400e; }
        .status-shipped { background: #dbeafe; color: #1e40af; }
        .status-delivered { background: #d1fae5; color: #065f46; }
        .status-cancelled { background: #fee2e2; color: #991b1b; }
        .btn { padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 500; text-decoration: none; transition: 0.2s; }
        .btn-primary { background: #6366f1; color: #fff; }
        .btn-outline { border: 1px solid #6366f1; color: #6366f1; }
        .loading-spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #6366f1; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </DashboardLayout>
  );
};

export default VendorDashboard;
// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { HiOutlineCube, HiOutlineTruck, HiOutlineCheckCircle, HiOutlineCurrencyRupee } from 'react-icons/hi';
// import toast from 'react-hot-toast';
// import API from '../services/api';
// import { useAuth } from '../context/AuthContext';
// import DashboardLayout from '../components/DashboardLayout';

// const VendorDashboard = () => {
//   const { user } = useAuth();
//   const [stats, setStats] = useState({
//     totalProducts: 0,
//     activeOrders: 0,
//     completedOrders: 0,
//     revenue: 0,
//   });
//   const [recentOrders, setRecentOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         const [statsRes, ordersRes] = await Promise.all([
//           API.get('/api/orders/vendor/stats'),
//           API.get('/api/orders/vendor'),
//         ]);

//         setStats({
//           totalProducts: statsRes.data.totalProducts || 0,
//           activeOrders: statsRes.data.activeOrders || 0,
//           completedOrders: statsRes.data.completedOrders || 0,
//           revenue: statsRes.data.revenue || 0,
//         });

//         const allOrders = ordersRes.data.orders || ordersRes.data || [];
//         setRecentOrders(
//           Array.isArray(allOrders)
//             ? allOrders.slice(0, 5)
//             : []
//         );
//       } catch (error) {
//         setStats({
//           totalProducts: 0,
//           activeOrders: 0,
//           completedOrders: 0,
//           revenue: 0,
//         });
//         setRecentOrders([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, []);

//   const formatCurrency = (amount) => {
//     return `₹${Number(amount).toLocaleString('en-IN')}`;
//   };

//   const formatDate = (dateStr) => {
//     return new Date(dateStr).toLocaleDateString('en-IN', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric',
//     });
//   };

//   const statCards = [
//     {
//       title: 'Total Products',
//       value: stats.totalProducts,
//       icon: <HiOutlineCube className="stat-icon" />,
//       color: '#6366f1',
//     },
//     {
//       title: 'Active Orders',
//       value: stats.activeOrders,
//       icon: <HiOutlineTruck className="stat-icon" />,
//       color: '#f59e0b',
//     },
//     {
//       title: 'Completed Orders',
//       value: stats.completedOrders,
//       icon: <HiOutlineCheckCircle className="stat-icon" />,
//       color: '#10b981',
//     },
//     {
//       title: 'Revenue',
//       value: formatCurrency(stats.revenue),
//       icon: <HiOutlineCurrencyRupee className="stat-icon" />,
//       color: '#ec4899',
//     },
//   ];

//   const getStatusBadgeClass = (status) => {
//     switch (status) {
//       case 'Processing':
//         return 'status-badge status-processing';
//       case 'Shipped':
//         return 'status-badge status-shipped';
//       case 'Delivered':
//         return 'status-badge status-delivered';
//       case 'Cancelled':
//         return 'status-badge status-cancelled';
//       default:
//         return 'status-badge status-processing';
//     }
//   };

//   if (loading) {
//     return (
//       <DashboardLayout role="Vendor" activePage="Dashboard">
//         <div className="loading-spinner-container">
//           <div className="loading-spinner" />
//           <p>Loading dashboard...</p>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout role="Vendor" activePage="Dashboard">
//       <div className="vendor-dashboard">
//         {/* Welcome Section */}
//         <div className="dashboard-welcome">
//           <div>
//             <h1>Welcome back, {user?.name || 'Vendor'}!</h1>
//             <p className="text-muted">
//               Manage your store — <strong>{user?.storeName || 'My Store'}</strong>
//             </p>
//           </div>
//           <div className="quick-actions">
//             <Link to="/vendor/add-product" className="btn btn-primary">
//               + Add New Product
//             </Link>
//             <Link to="/vendor/products" className="btn btn-outline">
//               View All Products
//             </Link>
//           </div>
//         </div>

//         {/* Stat Cards */}
//         <div className="stat-cards">
//           {statCards.map((card, index) => (
//             <div className="stat-card" key={index}>
//               <div className="stat-card-icon" style={{ backgroundColor: card.color }}>
//                 {card.icon}
//               </div>
//               <div className="stat-card-info">
//                 <span className="stat-card-title">{card.title}</span>
//                 <span className="stat-card-value">{card.value}</span>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Recent Orders */}
//         <div className="dashboard-section">
//           <div className="section-header">
//             <h2>Recent Orders</h2>
//             <Link to="/vendor/orders" className="view-all-link">
//               View All →
//             </Link>
//           </div>

//           {recentOrders.length === 0 ? (
//             <div className="empty-state">
//               <HiOutlineTruck className="empty-icon" />
//               <h3>No orders yet</h3>
//               <p>Your recent orders will appear here once customers start purchasing.</p>
//             </div>
//           ) : (
//             <div className="table-responsive">
//               <table className="data-table">
//                 <thead>
//                   <tr>
//                     <th>Order ID</th>
//                     <th>Customer</th>
//                     <th>Total</th>
//                     <th>Status</th>
//                     <th>Date</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {recentOrders.map((order) => (
//                     <tr key={order._id}>
//                       <td className="font-mono">
//                         #{order._id?.slice(-8) || 'N/A'}
//                       </td>
//                       <td>{order.user?.name || order.customerName || 'Customer'}</td>
//                       <td className="font-semibold">
//                         {formatCurrency(order.totalAmount || order.total || 0)}
//                       </td>
//                       <td>
//                         <span className={getStatusBadgeClass(order.status)}>
//                           {order.status || 'Processing'}
//                         </span>
//                       </td>
//                       <td className="text-muted">
//                         {formatDate(order.createdAt || order.orderDate)}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       <style>{`
//         .vendor-dashboard {
//           max-width: 1200px;
//         }
//         .dashboard-welcome {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 2rem;
//           flex-wrap: wrap;
//           gap: 1rem;
//         }
//         .dashboard-welcome h1 {
//           font-size: 1.75rem;
//           font-weight: 700;
//           margin: 0;
//           color: var(--text-primary, #1a1a2e);
//         }
//         .dashboard-welcome .text-muted {
//           margin: 0.25rem 0 0;
//           color: var(--text-secondary, #6b7280);
//         }
//         .quick-actions {
//           display: flex;
//           gap: 0.75rem;
//         }
//         .stat-cards {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
//           gap: 1.25rem;
//           margin-bottom: 2rem;
//         }
//         .stat-card {
//           background: #fff;
//           border-radius: 12px;
//           padding: 1.25rem;
//           display: flex;
//           align-items: center;
//           gap: 1rem;
//           box-shadow: 0 1px 3px rgba(0,0,0,0.08);
//           border: 1px solid #f0f0f0;
//           transition: transform 0.2s, box-shadow 0.2s;
//         }
//         .stat-card:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 4px 12px rgba(0,0,0,0.1);
//         }
//         .stat-card-icon {
//           width: 48px;
//           height: 48px;
//           border-radius: 12px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           flex-shrink: 0;
//         }
//         .stat-card-icon svg,
//         .stat-icon {
//           width: 24px;
//           height: 24px;
//           color: #fff;
//         }
//         .stat-card-info {
//           display: flex;
//           flex-direction: column;
//         }
//         .stat-card-title {
//           font-size: 0.8rem;
//           color: #6b7280;
//           text-transform: uppercase;
//           letter-spacing: 0.5px;
//         }
//         .stat-card-value {
//           font-size: 1.5rem;
//           font-weight: 700;
//           color: #1a1a2e;
//         }
//         .dashboard-section {
//           background: #fff;
//           border-radius: 12px;
//           padding: 1.5rem;
//           box-shadow: 0 1px 3px rgba(0,0,0,0.08);
//           border: 1px solid #f0f0f0;
//         }
//         .section-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 1rem;
//         }
//         .section-header h2 {
//           font-size: 1.25rem;
//           font-weight: 600;
//           margin: 0;
//         }
//         .view-all-link {
//           color: #6366f1;
//           text-decoration: none;
//           font-size: 0.9rem;
//           font-weight: 500;
//         }
//         .view-all-link:hover {
//           text-decoration: underline;
//         }
//         .data-table {
//           width: 100%;
//           border-collapse: collapse;
//         }
//         .data-table th,
//         .data-table td {
//           padding: 0.75rem 1rem;
//           text-align: left;
//           border-bottom: 1px solid #f0f0f0;
//         }
//         .data-table th {
//           font-size: 0.8rem;
//           text-transform: uppercase;
//           letter-spacing: 0.5px;
//           color: #6b7280;
//           font-weight: 600;
//           background: #fafafa;
//         }
//         .data-table tbody tr:hover {
//           background: #f9fafb;
//         }
//         .font-mono {
//           font-family: monospace;
//           font-size: 0.85rem;
//         }
//         .font-semibold {
//           font-weight: 600;
//         }
//         .text-muted {
//           color: #6b7280;
//         }
//         .status-badge {
//           display: inline-block;
//           padding: 0.25rem 0.75rem;
//           border-radius: 9999px;
//           font-size: 0.75rem;
//           font-weight: 600;
//           text-transform: uppercase;
//           letter-spacing: 0.3px;
//         }
//         .status-processing {
//           background: #f59e0b;
//           color: #fff;
//         }
//         .status-shipped {
//           background: #3b82f6;
//           color: #fff;
//         }
//         .status-delivered {
//           background: #10b981;
//           color: #fff;
//         }
//         .status-cancelled {
//           background: #ef4444;
//           color: #fff;
//         }
//         .empty-state {
//           text-align: center;
//           padding: 3rem 1rem;
//           color: #6b7280;
//         }
//         .empty-icon {
//           width: 48px;
//           height: 48px;
//           margin: 0 auto 1rem;
//           color: #d1d5db;
//         }
//         .empty-state h3 {
//           margin: 0 0 0.5rem;
//           color: #374151;
//         }
//         .empty-state p {
//           margin: 0;
//           font-size: 0.9rem;
//         }
//         .loading-spinner-container {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           padding: 4rem;
//           color: #6b7280;
//         }
//         .loading-spinner {
//           width: 40px;
//           height: 40px;
//           border: 3px solid #e5e7eb;
//           border-top-color: #6366f1;
//           border-radius: 50%;
//           animation: spin 0.8s linear infinite;
//           margin-bottom: 1rem;
//         }
//         @keyframes spin {
//           to { transform: rotate(360deg); }
//         }
//         .btn {
//           display: inline-flex;
//           align-items: center;
//           gap: 0.5rem;
//           padding: 0.625rem 1.25rem;
//           border-radius: 8px;
//           font-size: 0.9rem;
//           font-weight: 500;
//           text-decoration: none;
//           cursor: pointer;
//           border: none;
//           transition: all 0.2s;
//         }
//         .btn-primary {
//           background: #6366f1;
//           color: #fff;
//         }
//         .btn-primary:hover {
//           background: #4f46e5;
//           color: #fff;
//         }
//         .btn-outline {
//           background: transparent;
//           color: #6366f1;
//           border: 1px solid #6366f1;
//         }
//         .btn-outline:hover {
//           background: #eef2ff;
//           color: #6366f1;
//         }
//         .table-responsive {
//           overflow-x: auto;
//         }
//         @media (max-width: 640px) {
//           .dashboard-welcome {
//             flex-direction: column;
//             align-items: flex-start;
//           }
//           .stat-cards {
//             grid-template-columns: 1fr 1fr;
//           }
//         }
//       `}</style>
//     </DashboardLayout>
//   );
// };

// export default VendorDashboard;
