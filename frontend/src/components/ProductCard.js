import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { HiShoppingCart, HiHeart } from 'react-icons/hi';
import API from '../services/api';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, isAuthenticated } = useAuth();

  // Handle both array images and single image
  const productImage = product.images?.[0] || product.image || '';
  const defaultImage = 'https://placehold.co/250x220/e2e8f0/64748b?text=No+Image';

  // Handle category as object (populated) or string
  const categoryName = product.category?.name || product.category || 'General';
  const categorySlug = product.category?.slug || product.category || '';

  // Handle vendor as vendorId (populated) or vendor
  const vendor = product.vendorId || product.vendor;

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleClick = () => {
    navigate(`/product/${product._id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleAddToWishlist = async (e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add products to wishlist');
      navigate('/login');
      return;
    }

    try {
      await API.post('/api/recommendations/activity', {
        productId: product._id,
        actionType: 'like',
      });
      toast.success('Added to wishlist');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to wishlist');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} style={{ color: '#FFB800' }}>★</span>);
      } else if (i === fullStars && hasHalf) {
        stars.push(<span key={i} style={{ color: '#FFB800' }}>★</span>);
      } else {
        stars.push(<span key={i} style={{ color: '#DEE2E6' }}>★</span>);
      }
    }
    return stars;
  };

  return (
    <div className="product-card slide-up">
      <div className="product-card-img" onClick={handleClick}>
        <img
          src={productImage || defaultImage}
          alt={product.name}
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />
        <div className="product-card-badge">
          {discount > 0 && (
            <span className="badge-discount">{discount}% OFF</span>
          )}
          {product.isNew && (
            <span className="badge-new">NEW</span>
          )}
          {product.isFeatured && !product.isNew && (
            <span className="badge-featured">FEATURED</span>
          )}
        </div>
        <button className="product-card-wishlist" title="Add to Wishlist" onClick={handleAddToWishlist}>
          <HiHeart />
        </button>
      </div>

      <div className="product-card-body">
        <div className="product-card-category">{categoryName}</div>
        <h3 className="product-card-name" onClick={handleClick}>
          {product.name}
        </h3>
        <div className="product-card-rating">
          <div className="product-card-stars">
            {renderStars(product.rating || 0)}
          </div>
          <span className="product-card-rating-text">
            {(product.rating || 0).toFixed(1)}
            {product.numReviews > 0 && ` (${product.numReviews})`}
          </span>
        </div>
        <div className="product-card-price">
          <span className="current-price">₹{product.price?.toLocaleString('en-IN')}</span>
          {product.comparePrice && (
            <>
              <span className="original-price">₹{product.comparePrice.toLocaleString('en-IN')}</span>
              <span className="discount-percent">{discount}% off</span>
            </>
          )}
        </div>
        {vendor?.storeName && (
          <div className="product-card-vendor">
            by <span>{vendor.storeName}</span>
          </div>
        )}
      </div>

      <div className="product-card-actions">
        <button className="btn btn-primary btn-block btn-sm" onClick={handleAddToCart}>
          <HiShoppingCart /> Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
