import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import {
  HiUsers,
  HiCube,
  HiClipboardList,
  HiCurrencyRupee,
  HiTrendingUp,
  HiArrowRight,
} from 'react-icons/hi';

const formatCurrency = (amount) => `₹${Math.round(amount).toLocaleString('en-IN')}`;
const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const getStatusBadgeStyle = (status) => {
  const styles = {
    Processing: { background: '#FDCB6E', color: '#FFFFFF' },
    Shipped: { background: '#0984E3', color: '#FFFFFF' },
    Delivered: { background: '#00B894', color: '#FFFFFF' },
    Cancelled: { background: '#E17055', color: '#FFFFFF' },
  };
  return styles[status] || { background: '#ADB5BD', color: '#FFFFFF' };
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
  setLoading(true);
  try {
    // 1. Fetch Main Dashboard Data (Users, Products, Orders, Revenue)
    const dashRes = await API.get('/api/admin/dashboard');
    const dashData = dashRes.data?.data;

    if (dashData) {
      setStats({
        users: dashData.totalUsers || 0,
        products: dashData.totalProducts || 0,
        orders: dashData.totalOrders || 0,
        revenue: dashData.totalRevenue || 0,
      });
      setRecentOrders(dashData.recentOrders || []);
    }

    // 2. Fetch Analytics (Specifically for Top Vendors)
    const analyticsRes = await API.get('/api/admin/analytics');
    
    // Ensure we are grabbing the correct nested data object
    const analyticsData = analyticsRes.data?.data || analyticsRes.data;
    
    // Log this to your browser console to verify the vendor list is actually there
    console.log("Analytics Data Received:", analyticsData);
    
    setAnalytics(analyticsData);

  } catch (error) {
    console.error("Dashboard Fetch Error:", error);
    setStats({ users: 0, products: 0, orders: 0, revenue: 0 });
  } finally {
    setLoading(false);
  }
};

  const statCards = [
    { label: 'Total Users', value: stats?.users || 0, icon: <HiUsers />, color: '#0984E3', bgLight: '#E3F2FD' },
    { label: 'Total Products', value: stats?.products || 0, icon: <HiCube />, color: '#00B894', bgLight: '#E0FFF8' },
    { label: 'Total Orders', value: stats?.orders || 0, icon: <HiClipboardList />, color: '#FF6B35', bgLight: '#FFF0E8' },
    { label: 'Total Revenue', value: stats?.revenue ? formatCurrency(stats.revenue) : '₹0', icon: <HiCurrencyRupee />, color: '#6C5CE7', bgLight: '#F0EDFF', isText: true },
  ];

  if (loading) return <Loader />;

  return (
    <DashboardLayout role="Admin" activePage="Dashboard">
      
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {statCards.map((card) => (
          <div key={card.label} className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: card.bgLight, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                {card.icon}
              </div>
              <HiTrendingUp style={{ color: card.color, fontSize: '18px' }} />
            </div>
            <p style={{ fontSize: '13px', color: '#868E96', fontWeight: '500', marginBottom: '4px' }}>{card.label}</p>
            <h3 style={{ fontSize: card.isText ? '1.5rem' : '1.75rem', fontWeight: '800', color: '#212529', margin: 0 }}>{card.value}</h3>
          </div>
        ))}
      </div>

      {/* Main Grid: Orders & Vendors */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* Recent Orders Table */}
        <div className="card" style={{ padding: '0' }}>
          <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid #E9ECEF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Recent Orders</h3>
            <Link to="/admin/orders" className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}>View All <HiArrowRight /></Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '13px', color: '#868E96' }}>Order ID</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '13px', color: '#868E96' }}>Customer</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '13px', color: '#868E96' }}>Amount</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '13px', color: '#868E96' }}>Status</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '13px', color: '#868E96' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? recentOrders.map((order) => {
                  const badgeStyle = getStatusBadgeStyle(order.status);
                  return (
                    <tr key={order._id} style={{ borderBottom: '1px solid #F1F3F5' }}>
                      <td style={{ padding: '14px 24px', fontSize: '14px', fontWeight: '600' }}>#{order._id.slice(-8).toUpperCase()}</td>
                      {/* FIXED: Using order.user?.username to display 'harsh singh' etc instead of N/A */}
                      <td style={{ padding: '14px 24px', fontSize: '14px' }}>{order.user?.username || order.user?.name || 'N/A'}</td>
                      <td style={{ padding: '14px 24px', fontSize: '14px', fontWeight: '700' }}>{formatCurrency(order.totalAmount || 0)}</td>
                      <td style={{ padding: '14px 24px' }}><span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: badgeStyle.background, color: badgeStyle.color }}>{order.status}</span></td>
                      <td style={{ padding: '14px 24px', fontSize: '14px', color: '#868E96' }}>{formatDate(order.createdAt)}</td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#868E96' }}>No recent orders</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vendors Sidebar */}
        <div className="card" style={{ padding: '0' }}>
          <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid #E9ECEF' }}>
            <h3 style={{ margin: 0 }}>Top Vendors</h3>
          </div>
          <div style={{ padding: '16px 24px' }}>
            {analytics?.topVendors?.length > 0 ? analytics.topVendors.map((v, i) => (
              <div key={v.vendorId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: i !== analytics.topVendors.length - 1 ? '1px solid #f1f3f5' : 'none' }}>
                <div>
                  <p style={{ margin: '0 0 4px', fontWeight: '600', fontSize: '14px' }}>{v.vendorName}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#868E96' }}>{v.storeName || 'No Store'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 2px', fontWeight: '700', fontSize: '14px', color: '#00B894' }}>{formatCurrency(v.totalRevenue)}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#868E96' }}>{v.totalOrders} orders</p>
                </div>
              </div>
            )) : <p style={{ textAlign: 'center', color: '#868E96', padding: '20px' }}>No vendor data</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import API from '../services/api';
// import DashboardLayout from '../components/DashboardLayout';
// import Loader from '../components/Loader';
// import {
//   HiUsers,
//   HiCube,
//   HiClipboardList,
//   HiCurrencyRupee,
//   HiTrendingUp,
//   HiArrowRight,
//   HiShoppingCart,
// } from 'react-icons/hi';

// const formatCurrency = (amount) => `₹${Math.round(amount).toLocaleString('en-IN')}`;
// const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// const getStatusBadgeStyle = (status) => {
//   const styles = {
//     Processing: { background: '#FDCB6E', color: '#FFFFFF' },
//     Shipped: { background: '#0984E3', color: '#FFFFFF' },
//     Delivered: { background: '#00B894', color: '#FFFFFF' },
//     Cancelled: { background: '#E17055', color: '#FFFFFF' },
//   };
//   return styles[status] || { background: '#ADB5BD', color: '#FFFFFF' };
// };

// const AdminDashboard = () => {
//   const [stats, setStats] = useState(null);
//   const [analytics, setAnalytics] = useState(null);
//   const [recentOrders, setRecentOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   // Inside AdminDashboard.jsx -> fetchAllData
// const fetchAllData = async () => {
//   setLoading(true);
//   try {
//     const dashRes = await API.get('/api/admin/dashboard');
    
//     // Fix: Ensure we dive into dashRes.data.data
//     const dashData = dashRes.data?.data;

//     if (dashData) {
//       setStats({
//         users: dashData.totalUsers || 0,
//         products: dashData.totalProducts || 0,
//         orders: dashData.totalOrders || 0,
//         revenue: dashData.totalRevenue || 0,
//       });
//       setRecentOrders(dashData.recentOrders || []);
//     }

//     // 2. Fetch Analytics (Top Vendors, etc.)
//     const analyticsRes = await API.get('/api/admin/analytics');
//     setAnalytics(analyticsRes.data?.data || analyticsRes.data);

//   } catch (error) {
//     console.error("Dashboard Fetch Error:", error);
//     setStats({ users: 0, products: 0, orders: 0, revenue: 0 });
//   } finally {
//     setLoading(false);
//   }
// };
//   const getDashboardStats = async (req, res) => {
//   try {
//     const totalUsers = await User.countDocuments();
//     const totalProducts = await Product.countDocuments();
    
//     // Aggregate Total Revenue and Order Count
//     const orders = await Order.find();
//     const totalOrders = orders.length;
//     const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

//     res.json({
//       success: true,
//       totalUsers,
//       totalProducts,
//       totalOrders,
//       totalRevenue
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

//   const statCards = [
//     { label: 'Total Users', value: stats?.users || 0, icon: <HiUsers />, color: '#0984E3', bgLight: '#E3F2FD' },
//     { label: 'Total Products', value: stats?.products || 0, icon: <HiCube />, color: '#00B894', bgLight: '#E0FFF8' },
//     { label: 'Total Orders', value: stats?.orders || 0, icon: <HiClipboardList />, color: '#FF6B35', bgLight: '#FFF0E8' },
//     { label: 'Total Revenue', value: stats?.revenue ? formatCurrency(stats.revenue) : '₹0', icon: <HiCurrencyRupee />, color: '#6C5CE7', bgLight: '#F0EDFF', isText: true },
//   ];

//   if (loading) return <Loader />;

//   return (
//     <DashboardLayout role="Admin" activePage="Dashboard">
      
//       {/* Top Stats Grid */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
//         {statCards.map((card) => (
//           <div key={card.label} className="card" style={{ padding: '24px' }}>
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
//               <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: card.bgLight, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
//                 {card.icon}
//               </div>
//               <HiTrendingUp style={{ color: card.color, fontSize: '18px' }} />
//             </div>
//             <p style={{ fontSize: '13px', color: '#868E96', fontWeight: '500', marginBottom: '4px' }}>{card.label}</p>
//             <h3 style={{ fontSize: card.isText ? '1.5rem' : '1.75rem', fontWeight: '800', color: '#212529', margin: 0 }}>{card.value}</h3>
//           </div>
//         ))}
//       </div>

//       {/* Middle Grid: Recent Orders & Top Vendors */}
//       <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        
//         {/* Recent Orders */}
//         <div className="card" style={{ padding: '0' }}>
//           <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid #E9ECEF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <h3 style={{ margin: 0 }}>Recent Orders</h3>
//             <Link to="/admin/orders" className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}>View All <HiArrowRight /></Link>
//           </div>
//           <div style={{ overflowX: 'auto' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//               <thead>
//                 <tr>
//                   <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '13px', color: '#868E96' }}>Order ID</th>
//                   <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '13px', color: '#868E96' }}>Customer</th>
//                   <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '13px', color: '#868E96' }}>Amount</th>
//                   <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '13px', color: '#868E96' }}>Status</th>
//                   <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '13px', color: '#868E96' }}>Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {recentOrders.length > 0 ? recentOrders.slice(0, 5).map((order) => {
//                   const badgeStyle = getStatusBadgeStyle(order.status);
//                   return (
//                     <tr key={order._id} style={{ borderBottom: '1px solid #F1F3F5' }}>
//                       <td style={{ padding: '14px 24px', fontSize: '14px', fontWeight: '600' }}>#{typeof order._id === 'string' ? order._id.slice(-8).toUpperCase() : order._id}</td>
//                       <td style={{ padding: '14px 24px', fontSize: '14px' }}>{order.user?.name || 'N/A'}</td>
//                       <td style={{ padding: '14px 24px', fontSize: '14px', fontWeight: '700' }}>{formatCurrency(order.totalAmount || 0)}</td>
//                       <td style={{ padding: '14px 24px' }}><span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: badgeStyle.background, color: badgeStyle.color }}>{order.status}</span></td>
//                       <td style={{ padding: '14px 24px', fontSize: '14px', color: '#868E96' }}>{formatDate(order.createdAt)}</td>
//                     </tr>
//                   );
//                 }) : (
//                   <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#868E96' }}>No recent orders</td></tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Top Vendors Sidebar */}
//         <div className="card" style={{ padding: '0' }}>
//           <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid #E9ECEF' }}>
//             <h3 style={{ margin: 0 }}>Top Vendors</h3>
//           </div>
//           <div style={{ padding: '16px 24px' }}>
//             {analytics?.topVendors?.map((v, i) => (
//               <div key={v.vendorId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: i !== analytics.topVendors.length - 1 ? '1px solid #f1f3f5' : 'none' }}>
//                 <div>
//                   <p style={{ margin: '0 0 4px', fontWeight: '600', fontSize: '14px' }}>{v.vendorName}</p>
//                   <p style={{ margin: 0, fontSize: '12px', color: '#868E96' }}>{v.storeName || 'No Store'}</p>
//                 </div>
//                 <div style={{ textAlign: 'right' }}>
//                   <p style={{ margin: '0 0 2px', fontWeight: '700', fontSize: '14px', color: '#00B894' }}>{formatCurrency(v.totalRevenue)}</p>
//                   <p style={{ margin: 0, fontSize: '12px', color: '#868E96' }}>{v.totalOrders} orders</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Bottom Grid: Top Products & Categories */}
//       <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        
//         {/* Top Products Table */}
//         <div className="card" style={{ padding: '0' }}>
//           <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid #E9ECEF' }}>
//             <h3 style={{ margin: 0 }}>Top Selling Products</h3>
//           </div>
//           <div style={{ overflowX: 'auto' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//               <thead>
//                 <tr style={{ background: '#f8f9fa' }}>
//                   <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '13px', color: '#868E96' }}>Product Name</th>
//                   <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: '13px', color: '#868E96' }}>Sold</th>
//                   <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '13px', color: '#868E96' }}>Revenue</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {analytics?.topProducts?.map((p) => (
//                   <tr key={p.productId} style={{ borderBottom: '1px solid #f1f3f5' }}>
//                     <td style={{ padding: '16px 24px', fontWeight: '500', fontSize: '14px' }}>{p.name}</td>
//                     <td style={{ padding: '16px 24px', textAlign: 'center' }}>{p.totalSold}</td>
//                     <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '700', color: '#0984E3' }}>{formatCurrency(p.totalRevenue)}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Category Performance */}
//         <div className="card" style={{ padding: '24px' }}>
//           <h3 style={{ marginBottom: '20px', marginTop: 0 }}>Category Performance</h3>
//           {analytics?.categoryPerformance?.map((cat, i) => {
//             const maxRevenue = Math.max(...analytics.categoryPerformance.map(c => c.revenue));
//             const widthPercent = maxRevenue > 0 ? (cat.revenue / maxRevenue) * 100 : 0;
            
//             return (
//               <div key={cat.category} style={{ marginBottom: '20px' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
//                   <span style={{ fontWeight: '500', fontSize: '14px' }}>{cat.category}</span>
//                   <span style={{ fontWeight: '700', fontSize: '14px' }}>{formatCurrency(cat.revenue)}</span>
//                 </div>
//                 <div style={{ background: '#e9ecef', borderRadius: '4px', height: '10px', width: '100%' }}>
//                   <div style={{ background: '#FF6B35', height: '100%', width: `${widthPercent}%`, borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
//                 </div>
//                 <span style={{ fontSize: '12px', color: '#868e96' }}>{cat.totalSold} items sold</span>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//     </DashboardLayout>
//   );
// };

// export default AdminDashboard;
