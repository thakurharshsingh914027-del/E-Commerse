
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';
import {
  HiSearch,
  HiTrash,
  HiEye,
  HiRefresh,
  HiCube,
} from 'react-icons/hi';

const formatCurrency = (amount) => `₹${(amount || 0).toLocaleString('en-IN')}`;

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredProducts(
        products.filter((p) => {
          // SAFE CHECK: Category might be an object or a string
          const categoryName = p.category?.name || p.category || '';
          const productName = p.name || p.title || '';
          
          return (
            productName.toLowerCase().includes(query) ||
            categoryName.toString().toLowerCase().includes(query)
          );
        })
      );
    }
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await API.get('/api/products?limit=100');
      const data = response.data?.products || response.data || [];
      setProducts(Array.isArray(data) ? data : []);
      setFilteredProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load products');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(productId);
    try {
      await API.delete(`/api/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      toast.success(`"${productName}" deleted successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleStatus = async (product) => {
    const newStatus = product.isActive !== false;
    setToggling(product._id);
    try {
      await API.put(`/api/products/${product._id}`, {
        isActive: !newStatus, // Toggle the current state
      });
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, isActive: !newStatus } : p))
      );
      toast.success(`Product ${!newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product status');
    } finally {
      setToggling(null);
    }
  };

  const getProductImage = (product) => {
    if (product.images?.length > 0) {
      const firstImg = product.images[0];
      return typeof firstImg === 'object' ? firstImg.url : firstImg;
    }
    return product.image || null;
  };

  if (loading) {
    return (
      <DashboardLayout role="Admin" activePage="Products">
        <div className="data-table-wrapper">
          <div className="data-table-header">
            <h3>All Products</h3>
            <div className="data-table-search">
              <div className="skeleton" style={{ width: '250px', height: '40px', borderRadius: '8px' }} />
            </div>
          </div>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: '1px solid #E9ECEF', alignItems: 'center' }}>
              <div className="skeleton" style={{ width: '56px', height: '56px', borderRadius: '8px', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-text short" style={{ width: '60%', marginBottom: '8px' }} />
                <div className="skeleton skeleton-text medium" style={{ width: '40%' }} />
              </div>
              <div className="skeleton" style={{ width: '80px', height: '20px' }} />
              <div className="skeleton" style={{ width: '90px', height: '28px', borderRadius: '14px' }} />
              <div className="skeleton" style={{ width: '60px', height: '34px', borderRadius: '6px' }} />
            </div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="Admin" activePage="Products">
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <h3>
            All Products
            <span style={{ marginLeft: '8px', fontSize: '13px', fontWeight: '500', color: '#868E96' }}>
              ({filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'})
            </span>
          </h3>
          <div className="data-table-search">
            <HiSearch />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '300px' }}
            />
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF' }}>Product</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF' }}>Category</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF' }}>Price</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF' }}>Stock</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF' }}>Vendor</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const imageUrl = getProductImage(product);
                  const isActive = product.isActive !== false;
                  
                  // FIX: Handle Category Object
                  const displayCategory = product.category?.name || product.category || 'General';
                  
                  // FIX: Handle Vendor Object
                  const displayVendor = product.vendorId?.storeName || product.vendor?.name || product.createdBy?.name || 'Admin';

                  return (
                    <tr key={product._id} style={{ borderBottom: '1px solid #F1F3F5' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img 
                            src={imageUrl || 'https://placehold.co/48'} 
                            alt="" 
                            style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} 
                          />
                          <span style={{ fontWeight: '600', fontSize: '14px' }}>{product.name || product.title}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px' }}>{displayCategory}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '700' }}>{formatCurrency(product.price)}</td>
                      <td style={{ padding: '12px 16px' }}>{product.stock ?? 0}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px' }}>{displayVendor}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => handleToggleStatus(product)}
                          className={`badge ${isActive ? 'bg-success' : 'bg-danger'}`}
                          style={{ border: 'none', color: 'white', borderRadius: '20px', padding: '4px 12px', fontSize: '11px' }}
                        >
                          {isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <Link to={`/product/${product._id}`} className="btn-icon text-primary"><HiEye /></Link>
                          <button 
                            onClick={() => handleDelete(product._id, product.name)} 
                            className="btn-icon text-danger"
                            disabled={deleting === product._id}
                            style={{ border: 'none', background: 'none' }}
                          >
                            <HiTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <HiCube size={48} color="#ccc" />
            <p>No products found.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminProducts;
// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import API from '../services/api';
// import DashboardLayout from '../components/DashboardLayout';
// import toast from 'react-hot-toast';
// import {
//   HiSearch,
//   HiTrash,
//   HiEye,
//   HiRefresh,
//   HiCube,
// } from 'react-icons/hi';

// const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

// const AdminProducts = () => {
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [deleting, setDeleting] = useState(null);
//   const [toggling, setToggling] = useState(null);

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   useEffect(() => {
//     if (searchQuery.trim() === '') {
//       setFilteredProducts(products);
//     } else {
//       const query = searchQuery.toLowerCase();
//       setFilteredProducts(
//         products.filter(
//           (p) =>
//             p.name?.toLowerCase().includes(query) ||
//             p.title?.toLowerCase().includes(query) ||
//             p.category?.toLowerCase().includes(query)
//         )
//       );
//     }
//   }, [searchQuery, products]);

//   const fetchProducts = async () => {
//     setLoading(true);
//     try {
//       const response = await API.get('/api/products?limit=100');
//       const data = response.data?.products || response.data || [];
//       setProducts(Array.isArray(data) ? data : []);
//       setFilteredProducts(Array.isArray(data) ? data : []);
//     } catch (error) {
//       toast.error('Failed to load products');
//       setProducts([]);
//       setFilteredProducts([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (productId, productName) => {
//     if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
//       return;
//     }

//     setDeleting(productId);
//     try {
//       await API.delete(`/api/products/${productId}`);
//       setProducts((prev) => prev.filter((p) => p._id !== productId));
//       toast.success(`"${productName}" deleted successfully`);
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to delete product');
//     } finally {
//       setDeleting(null);
//     }
//   };

//   const handleToggleStatus = async (product) => {
//     const newStatus = product.isActive !== false;
//     setToggling(product._id);
//     try {
//       await API.put(`/api/products/${product._id}`, {
//         isActive: newStatus,
//       });
//       setProducts((prev) =>
//         prev.map((p) => (p._id === product._id ? { ...p, isActive: newStatus } : p))
//       );
//       toast.success(`Product ${newStatus ? 'activated' : 'deactivated'} successfully`);
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to update product status');
//     } finally {
//       setToggling(null);
//     }
//   };

//   const getProductImage = (product) => {
//     if (product.images?.length > 0) {
//       return product.images[0].url || product.images[0];
//     }
//     return null;
//   };

//   if (loading) {
//     return (
//       <DashboardLayout role="Admin" activePage="Products">
//         <div className="data-table-wrapper">
//           <div className="data-table-header">
//             <h3>All Products</h3>
//             <div className="data-table-search">
//               <div className="skeleton" style={{ width: '250px', height: '40px', borderRadius: '8px' }} />
//             </div>
//           </div>
//           {[...Array(8)].map((_, i) => (
//             <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: '1px solid #E9ECEF', alignItems: 'center' }}>
//               <div className="skeleton" style={{ width: '56px', height: '56px', borderRadius: '8px', flexShrink: 0 }} />
//               <div style={{ flex: 1 }}>
//                 <div className="skeleton skeleton-text short" style={{ width: '60%', marginBottom: '8px' }} />
//                 <div className="skeleton skeleton-text medium" style={{ width: '40%' }} />
//               </div>
//               <div className="skeleton" style={{ width: '80px', height: '20px' }} />
//               <div className="skeleton" style={{ width: '80px', height: '20px' }} />
//               <div className="skeleton" style={{ width: '90px', height: '28px', borderRadius: '14px' }} />
//               <div className="skeleton" style={{ width: '60px', height: '34px', borderRadius: '6px' }} />
//             </div>
//           ))}
//         </div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout role="Admin" activePage="Products">
//       <div className="data-table-wrapper">
//         <div className="data-table-header">
//           <h3>
//             All Products
//             <span style={{
//               marginLeft: '8px',
//               fontSize: '13px',
//               fontWeight: '500',
//               color: '#868E96',
//             }}>
//               ({filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'})
//             </span>
//           </h3>
//           <div className="data-table-search">
//             <HiSearch />
//             <input
//               type="text"
//               placeholder="Search products by name or category..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               style={{ width: '300px' }}
//             />
//           </div>
//         </div>

//         {filteredProducts.length > 0 ? (
//           <div style={{ overflowX: 'auto' }}>
//             <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
//               <thead>
//                 <tr>
//                   <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF', whiteSpace: 'nowrap' }}>
//                     Product
//                   </th>
//                   <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF', whiteSpace: 'nowrap' }}>
//                     Category
//                   </th>
//                   <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF', whiteSpace: 'nowrap' }}>
//                     Price
//                   </th>
//                   <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF', whiteSpace: 'nowrap' }}>
//                     Stock
//                   </th>
//                   <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF', whiteSpace: 'nowrap' }}>
//                     Vendor
//                   </th>
//                   <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF', whiteSpace: 'nowrap' }}>
//                     Status
//                   </th>
//                   <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#868E96', borderBottom: '1px solid #E9ECEF', whiteSpace: 'nowrap' }}>
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredProducts.map((product) => {
//                   const imageUrl = getProductImage(product);
//                   const isActive = product.isActive !== false;
//                   return (
//                     <tr key={product._id}
//                       style={{ borderBottom: '1px solid #F1F3F5', transition: 'all 0.2s ease' }}
//                       onMouseEnter={(e) => e.currentTarget.style.background = '#F8F9FA'}
//                       onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
//                       <td style={{ padding: '12px 16px' }}>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//                           <div style={{
//                             width: '48px',
//                             height: '48px',
//                             borderRadius: '8px',
//                             overflow: 'hidden',
//                             background: '#F1F3F5',
//                             flexShrink: 0,
//                           }}>
//                             {imageUrl ? (
//                               <img
//                                 src={imageUrl}
//                                 alt={product.name || product.title}
//                                 style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                               />
//                             ) : (
//                               <div style={{
//                                 width: '100%',
//                                 height: '100%',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center',
//                                 color: '#CED4DA',
//                                 fontSize: '20px',
//                               }}>
//                                 <HiCube />
//                               </div>
//                             )}
//                           </div>
//                           <div style={{ minWidth: 0 }}>
//                             <h5 style={{
//                               fontSize: '14px',
//                               fontWeight: '600',
//                               color: '#212529',
//                               margin: 0,
//                               whiteSpace: 'nowrap',
//                               overflow: 'hidden',
//                               textOverflow: 'ellipsis',
//                               maxWidth: '200px',
//                             }}>
//                               {product.name || product.title || 'Untitled Product'}
//                             </h5>
//                           </div>
//                         </div>
//                       </td>
//                       <td style={{ padding: '12px 16px', fontSize: '13px', color: '#495057', whiteSpace: 'nowrap' }}>
//                         {product.category || 'N/A'}
//                       </td>
//                       <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '700', color: '#212529', whiteSpace: 'nowrap' }}>
//                         {formatCurrency(product.price || product.sellingPrice || 0)}
//                       </td>
//                       <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
//                         <span style={{
//                           display: 'inline-flex',
//                           alignItems: 'center',
//                           gap: '4px',
//                           fontSize: '13px',
//                           fontWeight: '600',
//                           color: (product.stock || 0) > 10 ? '#00B894' : (product.stock || 0) > 0 ? '#FDCB6E' : '#E17055',
//                         }}>
//                           {product.stock !== undefined ? product.stock : 'N/A'}
//                           {product.stock !== undefined && product.stock <= 10 && product.stock > 0 && (
//                             <span style={{ fontSize: '11px', color: '#868E96', fontWeight: '400' }}>(Low)</span>
//                           )}
//                         </span>
//                       </td>
//                       <td style={{ padding: '12px 16px', fontSize: '13px', color: '#495057', whiteSpace: 'nowrap', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                         {product.vendor?.name || product.vendor?.storeName || product.createdBy?.name || 'N/A'}
//                       </td>
//                       <td style={{ padding: '12px 16px' }}>
//                         <button
//                           onClick={() => handleToggleStatus(product)}
//                           disabled={toggling === product._id}
//                           style={{
//                             display: 'inline-block',
//                             padding: '4px 12px',
//                             borderRadius: '20px',
//                             fontSize: '12px',
//                             fontWeight: '600',
//                             border: 'none',
//                             cursor: toggling === product._id ? 'not-allowed' : 'pointer',
//                             opacity: toggling === product._id ? 0.6 : 1,
//                             background: isActive ? '#00B894' : '#E17055',
//                             color: '#FFFFFF',
//                           }}
//                         >
//                           {toggling === product._id ? (
//                             <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
//                               <HiRefresh style={{ fontSize: '12px' }} /> ...
//                             </span>
//                           ) : (
//                             isActive ? 'Active' : 'Inactive'
//                           )}
//                         </button>
//                       </td>
//                       <td style={{ padding: '12px 16px' }}>
//                         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
//                           <Link
//                             to={`/product/${product._id}`}
//                             title="View Product"
//                             style={{
//                               width: '32px',
//                               height: '32px',
//                               borderRadius: '6px',
//                               display: 'inline-flex',
//                               alignItems: 'center',
//                               justifyContent: 'center',
//                               background: '#E3F2FD',
//                               color: '#0984E3',
//                               border: 'none',
//                               cursor: 'pointer',
//                               fontSize: '16px',
//                               transition: 'all 0.2s ease',
//                             }}
//                           >
//                             <HiEye />
//                           </Link>
//                           <button
//                             onClick={() => handleDelete(product._id, product.name || product.title || 'this product')}
//                             disabled={deleting === product._id}
//                             title="Delete Product"
//                             style={{
//                               width: '32px',
//                               height: '32px',
//                               borderRadius: '6px',
//                               display: 'inline-flex',
//                               alignItems: 'center',
//                               justifyContent: 'center',
//                               background: '#FFE8E3',
//                               color: '#E17055',
//                               border: 'none',
//                               cursor: deleting === product._id ? 'not-allowed' : 'pointer',
//                               fontSize: '16px',
//                               opacity: deleting === product._id ? 0.6 : 1,
//                               transition: 'all 0.2s ease',
//                             }}
//                           >
//                             {deleting === product._id ? <HiRefresh /> : <HiTrash />}
//                           </button>
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
//             <HiCube style={{ fontSize: '56px', color: '#CED4DA', marginBottom: '16px' }} />
//             <h4 style={{ color: '#495057', marginBottom: '8px' }}>
//               {searchQuery ? 'No products found' : 'No products yet'}
//             </h4>
//             <p style={{ color: '#868E96', fontSize: '14px', marginBottom: '20px' }}>
//               {searchQuery
//                 ? `No products matching "${searchQuery}"`
//                 : 'Products will appear here once vendors start listing'}
//             </p>
//             {searchQuery && (
//               <button
//                 className="btn btn-outline btn-sm"
//                 onClick={() => setSearchQuery('')}
//               >
//                 Clear Search
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// };

// export default AdminProducts;
