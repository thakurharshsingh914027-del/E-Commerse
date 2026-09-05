import React, { useState, useEffect } from 'react';
import API from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';
import {
  HiClipboardList,
  HiRefresh,
  HiExclamationCircle
} from 'react-icons/hi';

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const STATUS_TABS = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_COLORS = {
  Processing: { background: '#FDCB6E', color: '#FFFFFF' },
  Shipped: { background: '#0984E3', color: '#FFFFFF' },
  Delivered: { background: '#00B894', color: '#FFFFFF' },
  Cancelled: { background: '#E17055', color: '#FFFFFF' },
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (activeTab === 'All') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(
        orders.filter(
          (order) => (order.status || '').toLowerCase() === activeTab.toLowerCase()
        )
      );
    }
  }, [activeTab, orders]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Standardized to your admin route
      const response = await API.get('/api/admin/orders');
      const data = response.data?.data || response.data?.orders || response.data || [];
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Order fetch failed:", error);
      toast.error('Could not connect to Orders API');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (!newStatus) return;

    setUpdatingStatus(orderId);
    try {
      // Matches the backend route we discussed: PUT /api/admin/orders/:id/status
      await API.put(`/api/admin/orders/${orderId}/status`, { status: newStatus });
      
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getCustomerName = (order) => order.user?.name || order.shippingAddress?.name || 'Guest';
  const getItemCount = (order) => order.items?.length || 0;
  const getTotal = (order) => order.totalAmount || 0;

  const getStatusCounts = () => {
    const counts = { All: orders.length };
    STATUS_TABS.forEach((tab) => {
      if (tab !== 'All') {
        counts[tab] = orders.filter(
          (o) => (o.status || '').toLowerCase() === tab.toLowerCase()
        ).length;
      }
    });
    return counts;
  };

  if (loading) return (
    <DashboardLayout role="Admin" activePage="Orders">
      <div className="data-table-wrapper" style={{ padding: '20px' }}>
        <p>Loading orders...</p>
      </div>
    </DashboardLayout>
  );

  const statusCounts = getStatusCounts();

  return (
    <DashboardLayout role="Admin" activePage="Orders">
      <div className="data-table-wrapper" style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3>Manage Orders ({filteredOrders.length})</h3>
          <button onClick={fetchOrders} className="btn-refresh" style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#636E72' }}>
            <HiRefresh /> Refresh
          </button>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid #E9ECEF',
                background: activeTab === tab ? '#FF6B35' : '#fff',
                color: activeTab === tab ? '#fff' : '#495057',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              {tab} ({statusCounts[tab] || 0})
            </button>
          ))}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #F1F3F5', color: '#868E96', fontSize: '13px' }}>
                <th style={{ padding: '12px' }}>Order ID</th>
                <th style={{ padding: '12px' }}>Customer</th>
                <th style={{ padding: '12px' }}>Total</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const statusColor = STATUS_COLORS[order.status] || { background: '#ADB5BD', color: '#FFFFFF' };
                return (
                  <tr key={order._id} style={{ borderBottom: '1px solid #F1F3F5' }}>
                    <td style={{ padding: '15px 12px', fontWeight: '600', fontSize: '14px' }}>
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td style={{ padding: '15px 12px' }}>
                      <div style={{ fontSize: '14px' }}>{getCustomerName(order)}</div>
                      <div style={{ fontSize: '11px', color: '#868E96' }}>{formatDate(order.createdAt)}</div>
                    </td>
                    <td style={{ padding: '15px 12px', fontWeight: '700' }}>{formatCurrency(getTotal(order))}</td>
                    <td style={{ padding: '15px 12px' }}>
                      <span style={{ 
                        background: statusColor.background, 
                        color: statusColor.color, 
                        padding: '4px 10px', 
                        borderRadius: '12px', 
                        fontSize: '11px', 
                        fontWeight: '700' 
                      }}>
                        {order.status}
                      </span>
                      {order.status === 'Cancelled' && order.cancelReason && (
                         <div style={{ fontSize: '10px', color: '#E17055', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                           <HiExclamationCircle /> {order.cancelReason}
                         </div>
                      )}
                    </td>
                    <td style={{ padding: '15px 12px' }}>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        disabled={updatingStatus === order._id}
                        style={{ padding: '5px', borderRadius: '4px', fontSize: '12px', border: '1px solid #ddd' }}
                      >
                        {STATUS_TABS.filter(t => t !== 'All').map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminOrders;
// import React, { useState, useEffect } from 'react';
// import API from '../services/api';
// import DashboardLayout from '../components/DashboardLayout';
// import toast from 'react-hot-toast';
// import {
//   HiClipboardList,
//   HiRefresh,
// } from 'react-icons/hi';

// const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

// const formatDate = (date) =>
//   new Date(date).toLocaleDateString('en-IN', {
//     day: 'numeric',
//     month: 'short',
//     year: 'numeric',
//   });

// const STATUS_TABS = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

// const STATUS_COLORS = {
//   Processing: { background: '#FDCB6E', color: '#FFFFFF' },
//   Shipped: { background: '#0984E3', color: '#FFFFFF' },
//   Delivered: { background: '#00B894', color: '#FFFFFF' },
//   Cancelled: { background: '#E17055', color: '#FFFFFF' },
// };

// const AdminOrders = () => {
//   const [orders, setOrders] = useState([]);
//   const [filteredOrders, setFilteredOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('All');
//   const [updatingStatus, setUpdatingStatus] = useState(null);

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   useEffect(() => {
//     if (activeTab === 'All') {
//       setFilteredOrders(orders);
//     } else {
//       setFilteredOrders(
//         orders.filter(
//           (order) => (order.status || '').toLowerCase() === activeTab.toLowerCase()
//         )
//       );
//     }
//   }, [activeTab, orders]);

//   const fetchOrders = async () => {
//     setLoading(true);
//     try {
//       // 1. Try the most likely admin path first
//       const response = await API.get('/api/admin/orders');
//       console.log("Orders received:", response.data);
      
//       const data = response.data?.orders || response.data || [];
//       setOrders(Array.isArray(data) ? data : []);
//     } catch (error) {
//       console.error("Primary route failed, trying fallback...", error.response?.status);
      
//       try {
//         // 2. Try the general orders path
//         const fallbackResponse = await API.get('/api/orders');
//         const fallbackData = fallbackResponse.data?.orders || fallbackResponse.data || [];
//         setOrders(Array.isArray(fallbackData) ? fallbackData : []);
//       } catch (fallbackError) {
//         console.error("All order routes failed. Check backend server.js for app.use('/api/...')");
//         toast.error('Could not connect to Orders API');
//         setOrders([]);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };
//   const handleUpdateStatus = async (orderId, newStatus) => {
//   try {
//     // Correct Path: /api/admin/orders/[ID]/status
//     await API.put(`/api/admin/orders/${orderId}/status`, { status: newStatus });
//     toast.success("Status updated");
//     fetchOrders(); 
//   } catch (error) {
//     toast.error("Failed to update status");
//   }
// };

//   const getCustomerName = (order) => {
//     if (order.user?.name) return order.user.name;
//     if (order.shippingAddress?.name) return order.shippingAddress.name;
//     if (order.customerName) return order.customerName;
//     return 'N/A';
//   };

//   const getItemCount = (order) => {
//     if (order.items?.length) return order.items.length;
//     if (order.orderItems?.length) return order.orderItems.length;
//     return 0;
//   };

//   const getTotal = (order) => {
//     return order.totalAmount || order.total || order.totalPrice || 0;
//   };

//   const getPaymentMethod = (order) => {
//     if (order.paymentMethod) return order.paymentMethod;
//     if (order.paymentInfo?.method) return order.paymentInfo.method;
//     return 'N/A';
//   };

//   const getStatusCounts = () => {
//     const counts = { All: orders.length };
//     STATUS_TABS.forEach((tab) => {
//       if (tab !== 'All') {
//         counts[tab] = orders.filter(
//           (o) => (o.status || '').toLowerCase() === tab.toLowerCase()
//         ).length;
//       }
//     });
//     return counts;
//   };

//   if (loading) {
//     return (
//       <DashboardLayout role="Admin" activePage="Orders">
//         <div className="data-table-wrapper">
//           <div style={{
//             display: 'flex',
//             gap: '8px',
//             marginBottom: '20px',
//           }}>
//             {STATUS_TABS.map((tab) => (
//               <div key={tab} className="skeleton" style={{ width: '90px', height: '36px', borderRadius: '8px' }} />
//             ))}
//           </div>
//           {[...Array(6)].map((_, i) => (
//             <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: '1px solid #E9ECEF', alignItems: 'center' }}>
//               <div className="skeleton" style={{ width: '100px', height: '20px' }} />
//               <div className="skeleton" style={{ flex: 1, height: '20px' }} />
//               <div className="skeleton" style={{ width: '60px', height: '20px' }} />
//               <div className="skeleton" style={{ width: '80px', height: '20px' }} />
//               <div className="skeleton" style={{ width: '90px', height: '28px', borderRadius: '14px' }} />
//               <div className="skeleton" style={{ width: '120px', height: '34px', borderRadius: '6px' }} />
//             </div>
//           ))}
//         </div>
//       </DashboardLayout>
//     );
//   }

//   const statusCounts = getStatusCounts();

//   return (
//     <DashboardLayout role="Admin" activePage="Orders">
//       <div className="data-table-wrapper">
//         <div className="data-table-header">
//           <h3>
//             Manage Orders
//             <span style={{
//               marginLeft: '8px',
//               fontSize: '13px',
//               fontWeight: '500',
//               color: '#868E96',
//             }}>
//               ({filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'})
//             </span>
//           </h3>
//         </div>

//         {/* Status Filter Tabs */}
//         <div style={{
//           display: 'flex',
//           gap: '8px',
//           marginBottom: '20px',
//           flexWrap: 'wrap',
//         }}>
//           {STATUS_TABS.map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               style={{
//                 padding: '8px 16px',
//                 borderRadius: '8px',
//                 fontSize: '13px',
//                 fontWeight: '600',
//                 border: '2px solid',
//                 borderColor: activeTab === tab ? '#FF6B35' : '#E9ECEF',
//                 background: activeTab === tab ? '#FF6B35' : '#FFFFFF',
//                 color: activeTab === tab ? '#FFFFFF' : '#495057',
//                 cursor: 'pointer',
//                 transition: 'all 0.2s ease',
//                 display: 'inline-flex',
//                 alignItems: 'center',
//                 gap: '6px',
//               }}
//             >
//               {tab}
//               <span style={{
//                 display: 'inline-flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 minWidth: '20px',
//                 height: '20px',
//                 borderRadius: '10px',
//                 fontSize: '11px',
//                 fontWeight: '700',
//                 background: activeTab === tab ? 'rgba(255,255,255,0.25)' : '#F1F3F5',
//                 color: activeTab === tab ? '#FFFFFF' : '#868E96',
//                 padding: '0 6px',
//               }}>
//                 {statusCounts[tab] || 0}
//               </span>
//             </button>
//           ))}
//         </div>

//         {filteredOrders.length > 0 ? (
//           <div style={{ overflowX: 'auto' }}>
//             <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
//               <thead>
//                 <tr>
//                   <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF', whiteSpace: 'nowrap' }}>
//                     Order ID
//                   </th>
//                   <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF', whiteSpace: 'nowrap' }}>
//                     Customer
//                   </th>
//                   <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF', whiteSpace: 'nowrap' }}>
//                     Items
//                   </th>
//                   <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF', whiteSpace: 'nowrap' }}>
//                     Total
//                   </th>
//                   <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF', whiteSpace: 'nowrap' }}>
//                     Payment
//                   </th>
//                   <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF', whiteSpace: 'nowrap' }}>
//                     Status
//                   </th>
//                   <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF', whiteSpace: 'nowrap' }}>
//                     Date
//                   </th>
//                   <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF', whiteSpace: 'nowrap' }}>
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredOrders.map((order) => {
//                   const statusColor = STATUS_COLORS[order.status] || { background: '#ADB5BD', color: '#FFFFFF' };
//                   const isUpdating = updatingStatus === order._id;
//                   return (
//                     <tr key={order._id}
//                       style={{ borderBottom: '1px solid #F1F3F5', transition: 'all 0.2s ease' }}
//                       onMouseEnter={(e) => e.currentTarget.style.background = '#F8F9FA'}
//                       onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
//                       <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '600', color: '#212529', whiteSpace: 'nowrap' }}>
//                         #{typeof order._id === 'string' ? order._id.slice(-8).toUpperCase() : order._id}
//                       </td>
//                       <td style={{ padding: '14px 16px', fontSize: '14px', color: '#495057', whiteSpace: 'nowrap' }}>
//                         {getCustomerName(order)}
//                       </td>
//                       <td style={{ padding: '14px 16px', fontSize: '14px', color: '#495057', textAlign: 'center', whiteSpace: 'nowrap' }}>
//                         {getItemCount(order)}
//                       </td>
//                       <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700', color: '#212529', whiteSpace: 'nowrap' }}>
//                         {formatCurrency(getTotal(order))}
//                       </td>
//                       <td style={{ padding: '14px 16px', fontSize: '13px', color: '#495057', whiteSpace: 'nowrap' }}>
//                         <span style={{
//                           display: 'inline-block',
//                           padding: '3px 8px',
//                           borderRadius: '4px',
//                           fontSize: '12px',
//                           fontWeight: '500',
//                           background: '#F1F3F5',
//                           color: '#495057',
//                         }}>
//                           {getPaymentMethod(order)}
//                         </span>
//                       </td>
//                       <td style={{ padding: '14px 16px' }}>
//                         <span style={{
//                           display: 'inline-block',
//                           padding: '4px 12px',
//                           borderRadius: '20px',
//                           fontSize: '12px',
//                           fontWeight: '600',
//                           background: statusColor.background,
//                           color: statusColor.color,
//                           whiteSpace: 'nowrap',
//                         }}>
//                           {order.status || 'N/A'}
//                         </span>
//                       </td>
//                       <td style={{ padding: '14px 16px', fontSize: '13px', color: '#868E96', whiteSpace: 'nowrap' }}>
//                         {formatDate(order.createdAt || order.orderDate)}
//                       </td>
//                       <td style={{ padding: '14px 16px' }}>
//                         <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
//                           {isUpdating && (
//                             <HiRefresh style={{ fontSize: '14px', color: '#FF6B35', animation: 'spin 1s linear infinite' }} />
//                           )}
//                           <select
//                             value={order.status || ''}
//                             onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
//                             disabled={isUpdating}
//                             style={{
//                               padding: '6px 10px',
//                               borderRadius: '6px',
//                               fontSize: '12px',
//                               fontWeight: '500',
//                               border: '1.5px solid #E9ECEF',
//                               background: '#FFFFFF',
//                               color: '#495057',
//                               cursor: isUpdating ? 'not-allowed' : 'pointer',
//                               opacity: isUpdating ? 0.6 : 1,
//                               width: 'auto',
//                             }}
//                           >
//                             {STATUS_TABS.filter((t) => t !== 'All').map((status) => (
//                               <option key={status} value={status}>
//                                 {status}
//                               </option>
//                             ))}
//                           </select>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
//             <HiClipboardList style={{ fontSize: '56px', color: '#CED4DA', marginBottom: '16px' }} />
//             <h4 style={{ color: '#495057', marginBottom: '8px' }}>
//               {activeTab === 'All' ? 'No orders yet' : `No ${activeTab.toLowerCase()} orders`}
//             </h4>
//             <p style={{ color: '#868E96', fontSize: '14px', marginBottom: '20px' }}>
//               {activeTab === 'All'
//                 ? 'Orders will appear here once customers start purchasing'
//                 : `There are currently no orders with "${activeTab}" status`}
//             </p>
//             {activeTab !== 'All' && (
//               <button
//                 className="btn btn-outline btn-sm"
//                 onClick={() => setActiveTab('All')}
//               >
//                 View All Orders
//               </button>
//             )}
//           </div>
//         )}
//       </div>

//       <style>{`
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//       `}</style>
//     </DashboardLayout>
//   );
// };

// export default AdminOrders;
