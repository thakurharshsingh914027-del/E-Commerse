import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlinePlusCircle,
  HiOutlineSearch,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineEyeOff,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

const VendorProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [user?._id]);

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((p) => p.name?.toLowerCase().includes(query))
      );
    }
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    try {
      let res = await API.get('/api/vendor/products');
      let data = res.data.products || res.data;

      if (!Array.isArray(data)) {
        throw new Error('Unexpected response format');
      }

      setProducts(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load vendor products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Change from PUT to PATCH and add /vendor
const handleToggleActive = async (product) => {
  setTogglingId(product._id);
  try {
    const newStatus = !product.isActive;
    
    // FIX: URL must match the router prefix and method must be PATCH
    const res = await API.patch(`/api/vendor/products/${product._id}`, {
      isActive: newStatus,
    });

    setProducts((prev) =>
      prev.map((p) => (p._id === product._id ? { ...p, isActive: newStatus } : p))
    );
    toast.success(`Product is now ${newStatus ? 'Active' : 'Inactive'}`);
  } catch (error) {
    toast.error('Failed to update status');
  } finally {
    setTogglingId(null);
  }
};

 const handleDelete = async (productId, productName) => {
  if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) return;

  try {
    // FIX: Add "/products/" between /vendor/ and the ID
    await API.delete(`/api/vendor/products/${productId}`); 
    
    setProducts((prev) => prev.filter((p) => p._id !== productId));
    toast.success('Product deleted successfully');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to delete product');
  }
};

  const formatCurrency = (amount) => {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  // ✅ Safe image URL extractor
  const getImageUrl = (image) => {
    if (!image) return null;
    if (typeof image === 'string') return image;
    if (image.url) return image.url; // If it saved as an object from Cloudinary
    return null;
  };

  if (loading) {
    return (
      <DashboardLayout role="Vendor" activePage="Products">
        <div className="loading-spinner-container">
          <div className="loading-spinner" />
          <p>Loading products...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="Vendor" activePage="Products">
      <div className="vendor-products">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Products</h1>
            <p className="text-muted">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <Link to="/vendor/add-product" className="btn btn-primary">
            <HiOutlinePlusCircle /> Add New Product
          </Link>
        </div>

        {/* Search */}
        <div className="search-bar">
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Products Grid / Table */}
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <HiOutlineSearch className="empty-icon" />
            <h3>
              {searchQuery ? 'No products match your search' : 'No products yet'}
            </h3>
            <p>
              {searchQuery
                ? 'Try a different search term.'
                : 'Get started by adding your first product.'}
            </p>
            {!searchQuery && (
              <Link to="/vendor/add-product" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                <HiOutlinePlusCircle /> Add New Product
              </Link>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const thumbnailUrl = getImageUrl(product.image || product.images?.[0]);

                  return (
                    <tr key={product._id}>
                      <td>
                        <div className="product-thumbnail">
                          {thumbnailUrl ? (
                            <img
                              src={thumbnailUrl}
                              alt={product.name}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/50x50?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="no-image-placeholder">N/A</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="product-name">{product.name}</span>
                      </td>
                      <td className="text-muted">{product.category || '—'}</td>
                      <td className="font-semibold">
                        {formatCurrency(product.price || 0)}
                      </td>
                      <td>
                        <span className={`stock-badge ${product.stock > 0 ? 'stock-in' : 'stock-out'}`}>
                          {product.stock > 0 ? product.stock : 'Out of Stock'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${product.isActive ? 'status-active' : 'status-inactive'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link
                            to={`/vendor/edit-product/${product._id}`}
                            className="btn-icon btn-edit"
                            title="Edit"
                          >
                            <HiOutlinePencil />
                          </Link>
                          <button
                            onClick={() => handleToggleActive(product)}
                            className="btn-icon btn-toggle"
                            title={product.isActive ? 'Deactivate' : 'Activate'}
                            disabled={togglingId === product._id}
                          >
                            {product.isActive ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                          </button>
                          <button
                            onClick={() => handleDelete(product._id, product.name)}
                            className="btn-icon btn-delete"
                            title="Delete"
                          >
                            <HiOutlineTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .vendor-products {
          max-width: 1200px;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .page-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
          color: #1a1a2e;
        }
        .page-header .text-muted {
          margin: 0.25rem 0 0;
          color: #6b7280;
          font-size: 0.9rem;
        }
        .search-bar {
          display: flex;
          align-items: center;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 0 1rem;
          margin-bottom: 1.5rem;
          transition: border-color 0.2s;
        }
        .search-bar:focus-within {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        .search-icon {
          width: 20px;
          height: 20px;
          color: #9ca3af;
          flex-shrink: 0;
        }
        .search-input {
          flex: 1;
          border: none;
          outline: none;
          padding: 0.75rem 0.75rem;
          font-size: 0.9rem;
          background: transparent;
        }
        .table-responsive {
          overflow-x: auto;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          border: 1px solid #f0f0f0;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .data-table th,
        .data-table td {
          padding: 0.75rem 1rem;
          text-align: left;
          border-bottom: 1px solid #f0f0f0;
        }
        .data-table th {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6b7280;
          font-weight: 600;
          background: #fafafa;
          white-space: nowrap;
        }
        .data-table tbody tr:hover {
          background: #f9fafb;
        }
        .product-thumbnail {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .product-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .no-image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          color: #9ca3af;
          font-size: 0.7rem;
        }
        .product-name {
          font-weight: 500;
          max-width: 200px;
          display: inline-block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .font-semibold {
          font-weight: 600;
          white-space: nowrap;
        }
        .text-muted {
          color: #6b7280;
        }
        .stock-badge {
          display: inline-block;
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .stock-in {
          background: #d1fae5;
          color: #065f46;
        }
        .stock-out {
          background: #fee2e2;
          color: #991b1b;
        }
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .status-active {
          background: #d1fae5;
          color: #065f46;
        }
        .status-inactive {
          background: #fee2e2;
          color: #991b1b;
        }
        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }
        .btn-icon {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: #fff;
          cursor: pointer;
          transition: all 0.2s;
          color: #374151;
        }
        .btn-icon svg {
          width: 16px;
          height: 16px;
        }
        .btn-icon:hover {
          border-color: #6366f1;
          color: #6366f1;
        }
        .btn-delete:hover {
          border-color: #ef4444;
          color: #ef4444;
          background: #fef2f2;
        }
        .btn-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        .btn-primary {
          background: #6366f1;
          color: #fff;
        }
        .btn-primary:hover {
          background: #4f46e5;
          color: #fff;
        }
        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          border: 1px solid #f0f0f0;
          color: #6b7280;
        }
        .empty-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 1rem;
          color: #d1d5db;
        }
        .empty-state h3 {
          margin: 0 0 0.5rem;
          color: #374151;
        }
        .empty-state p {
          margin: 0;
          font-size: 0.9rem;
        }
        .loading-spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          color: #6b7280;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 1rem;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .product-name {
            max-width: 120px;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default VendorProducts;
// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import {
//   HiOutlinePlusCircle,
//   HiOutlineSearch,
//   HiOutlinePencil,
//   HiOutlineTrash,
//   HiOutlineEye,
//   HiOutlineEyeOff,
// } from 'react-icons/hi';
// import toast from 'react-hot-toast';
// import API from '../services/api';
// import { useAuth } from '../context/AuthContext';
// import DashboardLayout from '../components/DashboardLayout';

// const VendorProducts = () => {
//   const { user } = useAuth();
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [togglingId, setTogglingId] = useState(null);

//   useEffect(() => {
//     fetchProducts();
//   }, [user?._id]);

//   useEffect(() => {
//     const query = searchQuery.toLowerCase().trim();
//     if (!query) {
//       setFilteredProducts(products);
//     } else {
//       setFilteredProducts(
//         products.filter((p) => p.name?.toLowerCase().includes(query))
//       );
//     }
//   }, [searchQuery, products]);

//   const fetchProducts = async () => {
//     try {
//       let res = await API.get(`/api/products?vendor=${user._id}&limit=100`);
//       let data = res.data.products || res.data;

//       if (!Array.isArray(data)) {
//         throw new Error('Unexpected response format');
//       }

//       setProducts(data);
//     } catch (error) {
//       try {
//         const res = await API.get('/api/products?limit=100');
//         let data = res.data.products || res.data;
//         if (Array.isArray(data)) {
//           const vendorProducts = data.filter(
//             (p) => p.vendor === user._id || p.vendorId === user._id || p.vendor?._id === user._id
//           );
//           setProducts(vendorProducts);
//         }
//       } catch (fallbackError) {
//         setProducts([]);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleToggleActive = async (product) => {
//     setTogglingId(product._id);
//     try {
//       const newStatus = !product.isActive;
//       const res = await API.put(`/api/products/${product._id}`, {
//         isActive: newStatus,
//       });
//       setProducts((prev) =>
//         prev.map((p) =>
//           p._id === product._id
//             ? { ...p, isActive: newStatus }
//             : p
//         )
//       );
//       toast.success(
//         `Product marked as ${newStatus ? 'Active' : 'Inactive'}`
//       );
//     } catch (error) {
//       toast.error('Failed to update product status');
//     } finally {
//       setTogglingId(null);
//     }
//   };

//   const handleDelete = async (productId, productName) => {
//     if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
//       return;
//     }
//     try {
//       await API.delete(`/api/products/${productId}`);
//       setProducts((prev) => prev.filter((p) => p._id !== productId));
//       toast.success('Product deleted successfully');
//     } catch (error) {
//       toast.error('Failed to delete product');
//     }
//   };

//   const formatCurrency = (amount) => {
//     return `₹${Number(amount).toLocaleString('en-IN')}`;
//   };

//   if (loading) {
//     return (
//       <DashboardLayout role="Vendor" activePage="Products">
//         <div className="loading-spinner-container">
//           <div className="loading-spinner" />
//           <p>Loading products...</p>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout role="Vendor" activePage="Products">
//       <div className="vendor-products">
//         {/* Header */}
//         <div className="page-header">
//           <div>
//             <h1>Products</h1>
//             <p className="text-muted">
//               {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
//             </p>
//           </div>
//           <Link to="/vendor/add-product" className="btn btn-primary">
//             <HiOutlinePlusCircle /> Add New Product
//           </Link>
//         </div>

//         {/* Search */}
//         <div className="search-bar">
//           <HiOutlineSearch className="search-icon" />
//           <input
//             type="text"
//             placeholder="Search products by name..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="search-input"
//           />
//         </div>

//         {/* Products Grid / Table */}
//         {filteredProducts.length === 0 ? (
//           <div className="empty-state">
//             <HiOutlineSearch className="empty-icon" />
//             <h3>
//               {searchQuery ? 'No products match your search' : 'No products yet'}
//             </h3>
//             <p>
//               {searchQuery
//                 ? 'Try a different search term.'
//                 : 'Get started by adding your first product.'}
//             </p>
//             {!searchQuery && (
//               <Link to="/vendor/add-product" className="btn btn-primary" style={{ marginTop: '1rem' }}>
//                 <HiOutlinePlusCircle /> Add New Product
//               </Link>
//             )}
//           </div>
//         ) : (
//           <div className="table-responsive">
//             <table className="data-table">
//               <thead>
//                 <tr>
//                   <th>Image</th>
//                   <th>Name</th>
//                   <th>Category</th>
//                   <th>Price</th>
//                   <th>Stock</th>
//                   <th>Status</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredProducts.map((product) => (
//                   <tr key={product._id}>
//                     <td>
//                       <div className="product-thumbnail">
//                         {product.images?.[0] ? (
//                           <img
//                             src={product.images[0]}
//                             alt={product.name}
//                             onError={(e) => {
//                               e.target.src = 'https://via.placeholder.com/50x50?text=No+Image';
//                             }}
//                           />
//                         ) : (
//                           <div className="no-image-placeholder">N/A</div>
//                         )}
//                       </div>
//                     </td>
//                     <td>
//                       <span className="product-name">{product.name}</span>
//                     </td>
//                     <td className="text-muted">{product.category || '—'}</td>
//                     <td className="font-semibold">
//                       {formatCurrency(product.price || 0)}
//                     </td>
//                     <td>
//                       <span className={`stock-badge ${product.stock > 0 ? 'stock-in' : 'stock-out'}`}>
//                         {product.stock > 0 ? product.stock : 'Out of Stock'}
//                       </span>
//                     </td>
//                     <td>
//                       <span className={`status-badge ${product.isActive ? 'status-active' : 'status-inactive'}`}>
//                         {product.isActive ? 'Active' : 'Inactive'}
//                       </span>
//                     </td>
//                     <td>
//                       <div className="action-buttons">
//                         <Link
//                           to={`/vendor/edit-product/${product._id}`}
//                           className="btn-icon btn-edit"
//                           title="Edit"
//                         >
//                           <HiOutlinePencil />
//                         </Link>
//                         <button
//                           onClick={() => handleToggleActive(product)}
//                           className="btn-icon btn-toggle"
//                           title={product.isActive ? 'Deactivate' : 'Activate'}
//                           disabled={togglingId === product._id}
//                         >
//                           {product.isActive ? <HiOutlineEyeOff /> : <HiOutlineEye />}
//                         </button>
//                         <button
//                           onClick={() => handleDelete(product._id, product.name)}
//                           className="btn-icon btn-delete"
//                           title="Delete"
//                         >
//                           <HiOutlineTrash />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       <style>{`
//         .vendor-products {
//           max-width: 1200px;
//         }
//         .page-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 1.5rem;
//           flex-wrap: wrap;
//           gap: 1rem;
//         }
//         .page-header h1 {
//           font-size: 1.75rem;
//           font-weight: 700;
//           margin: 0;
//           color: #1a1a2e;
//         }
//         .page-header .text-muted {
//           margin: 0.25rem 0 0;
//           color: #6b7280;
//           font-size: 0.9rem;
//         }
//         .search-bar {
//           display: flex;
//           align-items: center;
//           background: #fff;
//           border: 1px solid #e5e7eb;
//           border-radius: 10px;
//           padding: 0 1rem;
//           margin-bottom: 1.5rem;
//           transition: border-color 0.2s;
//         }
//         .search-bar:focus-within {
//           border-color: #6366f1;
//           box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
//         }
//         .search-icon {
//           width: 20px;
//           height: 20px;
//           color: #9ca3af;
//           flex-shrink: 0;
//         }
//         .search-input {
//           flex: 1;
//           border: none;
//           outline: none;
//           padding: 0.75rem 0.75rem;
//           font-size: 0.9rem;
//           background: transparent;
//         }
//         .table-responsive {
//           overflow-x: auto;
//           background: #fff;
//           border-radius: 12px;
//           box-shadow: 0 1px 3px rgba(0,0,0,0.08);
//           border: 1px solid #f0f0f0;
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
//           white-space: nowrap;
//         }
//         .data-table tbody tr:hover {
//           background: #f9fafb;
//         }
//         .product-thumbnail {
//           width: 50px;
//           height: 50px;
//           border-radius: 8px;
//           overflow: hidden;
//           flex-shrink: 0;
//         }
//         .product-thumbnail img {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//         }
//         .no-image-placeholder {
//           width: 100%;
//           height: 100%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           background: #f3f4f6;
//           color: #9ca3af;
//           font-size: 0.7rem;
//         }
//         .product-name {
//           font-weight: 500;
//           max-width: 200px;
//           display: inline-block;
//           overflow: hidden;
//           text-overflow: ellipsis;
//           white-space: nowrap;
//         }
//         .font-semibold {
//           font-weight: 600;
//           white-space: nowrap;
//         }
//         .text-muted {
//           color: #6b7280;
//         }
//         .stock-badge {
//           display: inline-block;
//           padding: 0.2rem 0.6rem;
//           border-radius: 9999px;
//           font-size: 0.75rem;
//           font-weight: 600;
//         }
//         .stock-in {
//           background: #d1fae5;
//           color: #065f46;
//         }
//         .stock-out {
//           background: #fee2e2;
//           color: #991b1b;
//         }
//         .status-badge {
//           display: inline-block;
//           padding: 0.25rem 0.75rem;
//           border-radius: 9999px;
//           font-size: 0.75rem;
//           font-weight: 600;
//         }
//         .status-active {
//           background: #d1fae5;
//           color: #065f46;
//         }
//         .status-inactive {
//           background: #fee2e2;
//           color: #991b1b;
//         }
//         .action-buttons {
//           display: flex;
//           gap: 0.5rem;
//         }
//         .btn-icon {
//           width: 34px;
//           height: 34px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           border-radius: 8px;
//           border: 1px solid #e5e7eb;
//           background: #fff;
//           cursor: pointer;
//           transition: all 0.2s;
//           color: #374151;
//         }
//         .btn-icon svg {
//           width: 16px;
//           height: 16px;
//         }
//         .btn-icon:hover {
//           border-color: #6366f1;
//           color: #6366f1;
//         }
//         .btn-delete:hover {
//           border-color: #ef4444;
//           color: #ef4444;
//           background: #fef2f2;
//         }
//         .btn-toggle:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
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
//         .empty-state {
//           text-align: center;
//           padding: 3rem 1rem;
//           background: #fff;
//           border-radius: 12px;
//           box-shadow: 0 1px 3px rgba(0,0,0,0.08);
//           border: 1px solid #f0f0f0;
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
//         @media (max-width: 768px) {
//           .page-header {
//             flex-direction: column;
//             align-items: flex-start;
//           }
//           .product-name {
//             max-width: 120px;
//           }
//         }
//       `}</style>
//     </DashboardLayout>
//   );
// };

// export default VendorProducts;
