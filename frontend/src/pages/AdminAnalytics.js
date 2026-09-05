import React, { useState, useEffect } from 'react';
import API from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import { HiTrendingUp, HiShoppingCart, HiCube } from 'react-icons/hi';

const formatCurrency = (amount) => `₹${Math.round(amount).toLocaleString('en-IN')}`;

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await API.get('/api/admin/analytics');
      // Backend sends: { success: true, data: { revenueByMonth, topProducts... } }
      setData(res.data.data || res.data);
    } catch (error) {
      console.error("Analytics fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!data) return <div>No analytics data found.</div>;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return '#00B894';
      case 'Processing': return '#FDCB6E';
      case 'Shipped': return '#0984E3';
      case 'Cancelled': return '#E17055';
      default: return '#ADB5BD';
    }
  };

  return (
    <DashboardLayout role="Admin" activePage="Analytics">
      <h2 style={{ marginBottom: '24px', fontWeight: '700', color: '#212529' }}>Analytics & Reports</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Order Status Distribution */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', color: '#495057' }}>Order Status Breakdown</h3>
          {data.orderStatusDist?.map((item) => (
            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: getStatusColor(item._id) }}></div>
                <span style={{ fontWeight: '500' }}>{item._id}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontWeight: '700', display: 'block' }}>{item.count} Orders</span>
                <span style={{ fontSize: '0.85rem', color: '#636e72' }}>{formatCurrency(item.revenue)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Category Performance */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', color: '#495057' }}>Category Performance</h3>
          {data.categoryPerformance?.map((cat) => (
            <div key={cat.category} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: '500' }}>{cat.category}</span>
                <span style={{ fontWeight: '700' }}>{formatCurrency(cat.revenue)}</span>
              </div>
              <div style={{ background: '#e9ecef', borderRadius: '4px', height: '8px', width: '100%' }}>
                <div 
                  style={{ 
                    background: '#6C5CE7', 
                    height: '100%', 
                    width: `${Math.min((cat.revenue / 250000) * 100, 100)}%`, // Relative to highest
                    borderRadius: '4px' 
                  }}
                ></div>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#868e96' }}>{cat.totalSold} items sold</span>
            </div>
          ))}
        </div>

        {/* Top Products Table */}
        <div className="card" style={{ padding: '0', gridColumn: 'span 2' }}>
          <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid #dee2e6' }}>
            <h3 style={{ margin: 0 }}>Top Selling Products</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '13px', color: '#868E96' }}>Product Name</th>
                  <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: '13px', color: '#868E96' }}>Units Sold</th>
                  <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '13px', color: '#868E96' }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts?.map((p) => (
                  <tr key={p.productId} style={{ borderBottom: '1px solid #f1f3f5' }}>
                    <td style={{ padding: '16px 24px', fontWeight: '500' }}>{p.name}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>{p.totalSold}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '700', color: '#00B894' }}>{formatCurrency(p.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Vendors Table */}
        <div className="card" style={{ padding: '0', gridColumn: 'span 2' }}>
          <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid #dee2e6' }}>
            <h3 style={{ margin: 0 }}>Top Vendors</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '13px', color: '#868E96' }}>Vendor</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '13px', color: '#868E96' }}>Store</th>
                  <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: '13px', color: '#868E96' }}>Orders</th>
                  <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '13px', color: '#868E96' }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.topVendors?.map((v) => (
                  <tr key={v.vendorId} style={{ borderBottom: '1px solid #f1f3f5' }}>
                    <td style={{ padding: '16px 24px', fontWeight: '500' }}>{v.vendorName}</td>
                    <td style={{ padding: '16px 24px', color: '#636e72' }}>{v.storeName || 'N/A'}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>{v.totalOrders}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '700', color: '#6C5CE7' }}>{formatCurrency(v.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;