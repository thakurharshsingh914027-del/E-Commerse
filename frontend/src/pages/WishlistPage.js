import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiHeart, HiSearch, HiTrash } from 'react-icons/hi';
import ProductCard from '../components/ProductCard';
import API from '../services/api';

const WishlistPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/recommendations/wishlist');
      setProducts(res.data?.products || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    try {
      await API.delete(`/api/recommendations/wishlist/${productId}`);
      setProducts((prev) => prev.filter((product) => product._id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove product');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="container" style={{ padding: '36px 0 56px' }}>
      <div className="section-header">
        <div>
          <h1 style={{ marginBottom: '6px' }}>My Wishlist</h1>
          <p>{products.length} saved product{products.length === 1 ? '' : 's'}</p>
        </div>
        <Link to="/search" className="view-all">
          Browse Products <HiSearch />
        </Link>
      </div>

      {loading ? (
        <div className="product-grid">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="skeleton-card">
              <div className="skeleton skeleton-img" />
              <div className="skeleton skeleton-text title" />
              <div className="skeleton skeleton-text medium" />
              <div className="skeleton skeleton-text short" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product._id} style={{ position: 'relative' }}>
              <ProductCard product={product} />
              <button
                type="button"
                className="btn-icon"
                title="Remove from wishlist"
                disabled={removingId === product._id}
                onClick={() => handleRemove(product._id)}
                style={{ position: 'absolute', right: '12px', bottom: '12px', zIndex: 2 }}
              >
                <HiTrash />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <HiHeart />
          <h3>Your wishlist is empty</h3>
          <p>Tap the heart on any product to save it here for later.</p>
          <Link to="/search" className="btn btn-primary">
            Find Products
          </Link>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
