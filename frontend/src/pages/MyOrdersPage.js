import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import {
  HiShoppingBag,
  HiRefresh,
  HiChevronDown,
  HiChevronUp,
  HiLocationMarker,
  HiCreditCard,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiTruck,
} from 'react-icons/hi';

// --- Helpers ---
const STATUS_CONFIG = {
  Processing: { color: '#F39C12', bg: '#FFF8E7', icon: HiClock, label: 'Processing' },
  Shipped: { color: '#0984E3', bg: '#EBF5FF', icon: HiTruck, label: 'Shipped' },
  Delivered: { color: '#00B894', bg: '#E8F8F5', icon: HiCheckCircle, label: 'Delivered' },
  Cancelled: { color: '#E74C3C', bg: '#FDEDEC', icon: HiXCircle, label: 'Cancelled' },
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

const extractImageUrl = (image) => {
  if (!image) return 'https://via.placeholder.com/150';
  if (typeof image === 'string') return image;
  return image.url || 'https://via.placeholder.com/150';
};

// --- Sub-Components ---
const OrderDetailRow = ({ label, children, icon: Icon }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 0', borderBottom: '1px solid #F1F3F5' }}>
    {Icon && <span style={{ color: '#ADB5BD', marginTop: '2px', display: 'flex' }}><Icon /></span>}
    <div>
      <span style={{ fontSize: '12px', color: '#636E72', display: 'block' }}>{label}</span>
      <span style={{ fontSize: '14px', color: '#212529' }}>{children}</span>
    </div>
  </div>
);

const OrderSkeleton = () => (
  <div style={{ padding: '20px' }}>
    {[1, 2, 3].map((i) => (
      <div key={i} style={{ height: '100px', background: '#f8f9fa', borderRadius: '12px', marginBottom: '16px', animation: 'pulse 1.5s infinite' }} />
    ))}
  </div>
);

// --- Main Component ---
const MyOrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const res = await API.get('/api/orders/my');
      setOrders(res.data?.data || []);
    } catch (error) {
      console.error("Fetch error:", error.response);
      toast.error(error.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleCancelOrder = async (orderId) => {
    const reason = window.prompt("Please enter a reason for cancellation:");
    if (reason === null) return; // User clicked 'Cancel' on prompt

    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    
    try {
      // Sends the full ID and the reason object to match backend expectations
      await API.patch(`/api/orders/${orderId}/cancel`, { 
        reason: reason || "Cancelled by user" 
      });
      
      toast.success("Order cancelled successfully");
      fetchOrders(true); 
    } catch (error) {
      console.error("Cancel Error:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to cancel order");
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { from: '/orders' } });
    } else {
      fetchOrders();
    }
  }, [isAuthenticated, navigate, fetchOrders]);

  const toggleExpand = (id) => setExpandedOrderId(expandedOrderId === id ? null : id);

  if (loading) return <div className="container" style={{ padding: '40px 0' }}><OrderSkeleton /></div>;

  return (
    <div style={{ padding: '32px 0', minHeight: '80vh' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1>My Orders</h1>
            <p style={{ color: '#636E72' }}>{orders.length} orders total</p>
          </div>
          <button onClick={() => fetchOrders(true)} className="btn btn-outline" disabled={refreshing}>
            <HiRefresh style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} /> 
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <HiShoppingBag size={64} color="#ddd" />
            <h3>No orders found</h3>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-block' }}>Start Shopping</Link>
          </div>
        ) : (
          orders.map((order) => {
            const isExpanded = expandedOrderId === order._id;
            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.Processing;
            const StatusIcon = status.icon;

            return (
              <div key={order._id} style={{ background: '#fff', border: '1px solid #E9ECEF', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
                <div 
                  onClick={() => toggleExpand(order._id)}
                  style={{ padding: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}
                >
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div>
                      <small style={{ color: '#636E72', display: 'block' }}>ORDER ID</small>
                      <span style={{ fontWeight: '600', fontFamily: 'monospace' }}>#{order._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div>
                      <small style={{ color: '#636E72', display: 'block' }}>DATE</small>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <small style={{ color: '#636E72', display: 'block' }}>TOTAL</small>
                      <span style={{ fontWeight: '700' }}>{formatCurrency(order.totalAmount)}</span>
                    </div>
                    <div style={{ background: status.bg, color: status.color, padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <StatusIcon /> {status.label}
                    </div>
                    {isExpanded ? <HiChevronUp /> : <HiChevronDown />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: '24px', background: '#FAFBFC', borderTop: '1px solid #EEE' }}>
                    <div style={{ marginBottom: '20px' }}>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#fff', padding: '12px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #F1F3F5' }}>
                          <img src={extractImageUrl(item.image)} alt={item.name} style={{ width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover' }} />
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: '600' }}>{item.name}</p>
                            <small style={{ color: '#636E72' }}>Qty: {item.quantity} × {formatCurrency(item.price)}</small>
                          </div>
                          <span style={{ fontWeight: '600' }}>{formatCurrency(item.quantity * item.price)}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                      <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #F1F3F5' }}>
                        <h4 style={{ fontSize: '14px', marginBottom: '10px' }}><HiLocationMarker /> Shipping Address</h4>
                        <p style={{ fontSize: '14px', margin: 0 }}>{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
                        <p style={{ fontSize: '14px', margin: 0 }}>{order.shippingAddress?.state} - {order.shippingAddress?.zip}</p>
                        
                        {order.status === 'Processing' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelOrder(order._id);
                            }}
                            style={{
                              marginTop: '20px',
                              padding: '8px 12px',
                              background: '#FFF1F0',
                              color: '#CF1322',
                              border: '1px solid #FFA39E',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            <HiXCircle /> Cancel Order
                          </button>
                        )}
                      </div>
                      
                      <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #F1F3F5' }}>
                        <h4 style={{ fontSize: '14px', marginBottom: '10px' }}><HiCreditCard /> Payment Info</h4>
                        <OrderDetailRow label="Method">{order.paymentMethod}</OrderDetailRow>
                        <OrderDetailRow label="Status">
                           <span style={{ color: order.isPaid ? '#00B894' : '#F39C12', fontWeight: '600' }}>
                             {order.isPaid ? 'Paid' : 'Pending'}
                           </span>
                        </OrderDetailRow>

                        {/* Cancellation Reason Section */}
                        {order.status === 'Cancelled' && (
                          <div style={{ marginTop: '15px', padding: '12px', background: '#FFF1F0', border: '1px solid #FFA39E', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#CF1322', marginBottom: '4px' }}>
                              <HiXCircle size={14} />
                              <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>Reason</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '13px', color: '#444' }}>{order.cancelReason || "User request"}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default MyOrdersPage;
// import React, { useState, useEffect, useCallback } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import API from '../services/api';
// import toast from 'react-hot-toast';
// import {
//   HiShoppingBag,
//   HiRefresh,
//   HiChevronDown,
//   HiChevronUp,
//   HiLocationMarker,
//   HiCreditCard,
//   HiCalendar,
//   HiTruck,
//   HiCheckCircle,
//   HiXCircle,
//   HiClock,
//   HiCube,
// } from 'react-icons/hi';

// // --- Helpers ---
// const STATUS_CONFIG = {
//   Processing: { color: '#F39C12', bg: '#FFF8E7', icon: HiClock, label: 'Processing' },
//   Shipped: { color: '#0984E3', bg: '#EBF5FF', icon: HiTruck, label: 'Shipped' },
//   Delivered: { color: '#00B894', bg: '#E8F8F5', icon: HiCheckCircle, label: 'Delivered' },
//   Cancelled: { color: '#E74C3C', bg: '#FDEDEC', icon: HiXCircle, label: 'Cancelled' },
// };

// const formatDate = (dateString) => {
//   if (!dateString) return 'N/A';
//   return new Date(dateString).toLocaleDateString('en-IN', {
//     day: 'numeric',
//     month: 'short',
//     year: 'numeric',
//   });
// };

// const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

// const extractImageUrl = (image) => {
//   if (!image) return 'https://via.placeholder.com/150';
//   if (typeof image === 'string') return image;
//   return image.url || 'https://via.placeholder.com/150';
// };

// // --- Sub-Components ---
// const OrderDetailRow = ({ label, children, icon: Icon }) => (
//   <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 0', borderBottom: '1px solid #F1F3F5' }}>
//     {Icon && <span style={{ color: '#ADB5BD', marginTop: '2px', display: 'flex' }}><Icon /></span>}
//     <div>
//       <span style={{ fontSize: '12px', color: '#636E72', display: 'block' }}>{label}</span>
//       <span style={{ fontSize: '14px', color: '#212529' }}>{children}</span>
//     </div>
//   </div>
// );

// const OrderSkeleton = () => (
//   <div style={{ padding: '20px' }}>
//     {[1, 2, 3].map((i) => (
//       <div key={i} style={{ height: '100px', background: '#f8f9fa', borderRadius: '12px', marginBottom: '16px', animation: 'pulse 1.5s infinite' }} />
//     ))}
//   </div>
// );

// // --- Main Component ---
// const MyOrdersPage = () => {
//   const { isAuthenticated } = useAuth();
//   const navigate = useNavigate();
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [expandedOrderId, setExpandedOrderId] = useState(null);

//   const fetchOrders = useCallback(async (isRefresh = false) => {
//     isRefresh ? setRefreshing(true) : setLoading(true);
//     try {
//       const res = await API.get('/api/orders/my');
//       setOrders(res.data?.data || []);
//     } catch (error) {
//       console.error("Fetch error:", error.response);
//       toast.error(error.response?.data?.message || 'Failed to load orders');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   // --- NEW: Cancel Function ---
//  const handleCancelOrder = async (orderId) => {
//   if (!window.confirm("Are you sure you want to cancel this order?")) return;
  
//   try {
//     // Add /api here to match your backend mount point
//     await API.patch(`/api/orders/${orderId}/cancel`);
    
//     toast.success("Order cancelled successfully");
//     fetchOrders(true); // This will refresh the list automatically
//   } catch (error) {
//     console.error("Cancel Error Details:", error.response?.data);
//     toast.error(error.response?.data?.message || "Failed to cancel order");
//   }
// };
//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate('/login', { replace: true, state: { from: '/orders' } });
//     } else {
//       fetchOrders();
//     }
//   }, [isAuthenticated, navigate, fetchOrders]);

//   const toggleExpand = (id) => setExpandedOrderId(expandedOrderId === id ? null : id);

//   if (loading) return <div className="container" style={{ padding: '40px 0' }}><OrderSkeleton /></div>;

//   return (
//     <div style={{ padding: '32px 0', minHeight: '80vh' }}>
//       <div className="container">
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
//           <div>
//             <h1>My Orders</h1>
//             <p style={{ color: '#636E72' }}>{orders.length} orders total</p>
//           </div>
//           <button onClick={() => fetchOrders(true)} className="btn btn-outline" disabled={refreshing}>
//             <HiRefresh style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} /> 
//             {refreshing ? 'Refreshing...' : 'Refresh'}
//           </button>
//         </div>

//         {orders.length === 0 ? (
//           <div style={{ textAlign: 'center', padding: '60px 0' }}>
//             <HiShoppingBag size={64} color="#ddd" />
//             <h3>No orders found</h3>
//             <Link to="/" className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-block' }}>Start Shopping</Link>
//           </div>
//         ) : (
//           orders.map((order) => {
//             const isExpanded = expandedOrderId === order._id;
//             const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.Processing;
//             const StatusIcon = status.icon;

//             return (
//               <div key={order._id} style={{ background: '#fff', border: '1px solid #E9ECEF', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
//                 <div 
//                   onClick={() => toggleExpand(order._id)}
//                   style={{ padding: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}
//                 >
//                   <div style={{ display: 'flex', gap: '20px' }}>
//                     <div>
//                       <small style={{ color: '#636E72', display: 'block' }}>ORDER ID</small>
//                       <span style={{ fontWeight: '600', fontFamily: 'monospace' }}>#{order._id.slice(-8).toUpperCase()}</span>
//                     </div>
//                     <div>
//                       <small style={{ color: '#636E72', display: 'block' }}>DATE</small>
//                       <span>{formatDate(order.createdAt)}</span>
//                     </div>
//                   </div>

//                   <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
//                     <div style={{ textAlign: 'right' }}>
//                       <small style={{ color: '#636E72', display: 'block' }}>TOTAL</small>
//                       <span style={{ fontWeight: '700' }}>{formatCurrency(order.totalAmount)}</span>
//                     </div>
//                     <div style={{ background: status.bg, color: status.color, padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}>
//                       <StatusIcon /> {status.label}
//                     </div>
//                     {isExpanded ? <HiChevronUp /> : <HiChevronDown />}
//                   </div>
//                 </div>

//                 {isExpanded && (
//                   <div style={{ padding: '24px', background: '#FAFBFC', borderTop: '1px solid #EEE' }}>
//                     <div style={{ marginBottom: '20px' }}>
//                       {order.items.map((item, i) => (
//                         <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#fff', padding: '12px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #F1F3F5' }}>
//                           <img src={extractImageUrl(item.image)} alt={item.name} style={{ width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover' }} />
//                           <div style={{ flex: 1 }}>
//                             <p style={{ margin: 0, fontWeight: '600' }}>{item.name}</p>
//                             <small style={{ color: '#636E72' }}>Qty: {item.quantity} × {formatCurrency(item.price)}</small>
//                           </div>
//                           <span style={{ fontWeight: '600' }}>{formatCurrency(item.quantity * item.price)}</span>
//                         </div>
//                       ))}
//                     </div>

//                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
//                       <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #F1F3F5' }}>
//                         <h4 style={{ fontSize: '14px', marginBottom: '10px' }}><HiLocationMarker /> Shipping Address</h4>
//                         <p style={{ fontSize: '14px', margin: 0 }}>{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
//                         <p style={{ fontSize: '14px', margin: 0 }}>{order.shippingAddress?.state} - {order.shippingAddress?.zip}</p>
                        
//                         {/* --- NEW: Cancel Button --- */}
//                         {order.status === 'Processing' && (
//                           <button 
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleCancelOrder(order._id);
//                             }}
//                             style={{
//                               marginTop: '20px',
//                               padding: '8px 12px',
//                               background: '#FFF1F0',
//                               color: '#CF1322',
//                               border: '1px solid #FFA39E',
//                               borderRadius: '6px',
//                               fontSize: '13px',
//                               fontWeight: '600',
//                               cursor: 'pointer',
//                               display: 'flex',
//                               alignItems: 'center',
//                               gap: '5px'
//                             }}
//                           >
//                             <HiXCircle /> Cancel Order
//                           </button>
//                         )}
//                       </div>
                      
//                       <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #F1F3F5' }}>
//                         <h4 style={{ fontSize: '14px', marginBottom: '10px' }}><HiCreditCard /> Payment Info</h4>
//                         <OrderDetailRow label="Method">{order.paymentMethod}</OrderDetailRow>
//                         <OrderDetailRow label="Status">
//                            <span style={{ color: order.isPaid ? '#00B894' : '#F39C12', fontWeight: '600' }}>
//                              {order.isPaid ? 'Paid' : 'Pending'}
//                            </span>
//                         </OrderDetailRow>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             );
//           })
//         )}
//       </div>
//       <style>{`
//         @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
//         @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
//       `}</style>
//     </div>
//   );
// };

// export default MyOrdersPage;
