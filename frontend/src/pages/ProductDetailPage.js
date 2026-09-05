import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiArrowLeft,
  HiCheck,
  HiChevronRight,
  HiMinus,
  HiPlus,
  HiShieldCheck,
  HiShoppingCart,
  HiSparkles,
  HiStar,
  HiTruck,
  HiExclamation,
  HiHeart,
} from 'react-icons/hi';
import Loader from '../components/Loader';
import ProductCard from '../components/ProductCard';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const defaultImg = 'https://placehold.co/720x720/e2e8f0/64748b?text=No+Image';

const currency = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;

const extractImageUrl = (img) => {
  if (!img) return defaultImg;
  if (img.startsWith('http')) return img;

  const clean = img
    .replace('/uploads/products/products/', '/uploads/products/')
    .replace('/uploads/uploads/', '/uploads/');

  return `http://127.0.0.1:5000${clean}`;
};

const normalizeSpecifications = (specifications) => {
  if (!specifications) return [];

  if (Array.isArray(specifications)) {
    return specifications
      .map((spec, index) => {
        if (typeof spec === 'string') {
          return { key: `Feature ${index + 1}`, value: spec };
        }

        if (spec && typeof spec === 'object') {
          return {
            key: spec.key || `Feature ${index + 1}`,
            value: spec.value || '',
          };
        }

        return null;
      })
      .filter(Boolean);
  }

  if (typeof specifications === 'object') {
    return Object.entries(specifications)
      .filter(([key]) => key !== '_id')
      .map(([key, value]) => ({ key, value }));
  }

  return [];
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [boughtTogetherProducts, setBoughtTogetherProducts] = useState([]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/api/products/${id}`);
      const fetchedProduct = res.data;

      setProduct(fetchedProduct);
      setActiveImage(0);

      if (fetchedProduct) {
        fetchRelated(fetchedProduct);
        fetchRecommendationData(fetchedProduct._id);
        if (isAuthenticated) {
          trackActivity(fetchedProduct._id, 'view');
        }
      }
    } catch (error) {
      console.error('Product fetch error:', error.response?.data || error.message);
      toast.error('Product not found or server error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendationData = async (productId) => {
    try {
      const [similarRes, togetherRes] = await Promise.allSettled([
        API.get(`/api/recommendations/similar/${productId}`),
        API.get(`/api/recommendations/frequently-bought-together/${productId}`),
      ]);

      if (similarRes.status === 'fulfilled') {
        const data = similarRes.value.data;
        setSimilarProducts(data?.products || []);
      } else {
        setSimilarProducts([]);
      }

      if (togetherRes.status === 'fulfilled') {
        const data = togetherRes.value.data;
        setBoughtTogetherProducts(data?.products || []);
      } else {
        setBoughtTogetherProducts([]);
      }
    } catch (error) {
      console.error('Recommendation fetch error:', error.response?.data || error.message);
    }
  };

  const trackActivity = async (productId, actionType) => {
    if (!isAuthenticated) return;

    try {
      await API.post('/api/recommendations/activity', {
        productId,
        actionType,
        userId: user?._id || user?.id,
      });
    } catch (error) {
      console.error('Activity tracking error:', error.response?.data || error.message);
    }
  };

  const fetchRelated = async (prod) => {
    try {
      const categoryName =
        typeof prod.category === 'object' ? prod.category.name : prod.category;
      const res = await API.get(
        `/api/products?category=${encodeURIComponent(categoryName)}&limit=5&sort=newest`
      );
      const list = Array.isArray(res.data) ? res.data : res.data?.products || [];
      setRelatedProducts(list.filter((item) => item._id !== id).slice(0, 4));
    } catch (error) {
      console.error('Related fetch error:', error.response?.data || error.message);
      setRelatedProducts([]);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    trackActivity(product._id, 'cart');
    setQuantity(1);
    toast.success('Added to cart');
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    trackActivity(product._id, 'cart');
    navigate('/checkout');
  };

  const handleAddToWishlist = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      toast.error('Please login to add products to wishlist');
      navigate('/login');
      return;
    }

    try {
      await trackActivity(product._id, 'like');
      toast.success('Added to wishlist');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to wishlist');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to submit a review');
      navigate('/login');
      return;
    }

    if (reviewForm.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmittingReview(true);

    try {
      await API.post('/api/reviews', {
        ...reviewForm,
        product: id,
      });

      toast.success('Review submitted successfully');
      setReviewForm({ rating: 0, title: '', comment: '' });
      await fetchProduct();
      setActiveTab('reviews');
    } catch (error) {
      console.error('Review submit error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating, interactive = false) =>
    [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`star-button ${star <= rating ? 'active' : ''} ${interactive ? 'interactive' : ''}`}
        onClick={interactive ? () => setReviewForm((prev) => ({ ...prev, rating: star })) : undefined}
        aria-label={`${star} star${star > 1 ? 's' : ''}`}
      >
        <HiStar />
      </button>
    ));

  const validImages = useMemo(() => {
    if (product?.images?.length > 0) {
      return product.images.map(extractImageUrl).filter(Boolean);
    }

    return [extractImageUrl(product?.image)];
  }, [product]);

  const specifications = useMemo(
    () => normalizeSpecifications(product?.specifications),
    [product]
  );

  if (loading) return <Loader />;
  if (!product) return <div className="container" style={{ padding: '48px 0' }}>Product not found.</div>;

  const categoryName =
    product?.category?.name || (typeof product?.category === 'string' ? product.category : 'General');
  const vendorName =
    product?.vendor?.username || product?.vendor?.storeName || product?.vendor?.name || 'Trusted Seller';
  const price = Number(product.price || 0);
  const comparePrice = Number(product.comparePrice || 0);
  const discount = comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const inStock = Number(product.stock || 0) > 0;
  const reviewCount = Number(product.numReviews || product.reviews?.length || 0);

  return (
    <div className="product-detail fade-in">
      <div className="container">
        <button onClick={() => navigate(-1)} className="product-detail-back">
          <HiArrowLeft /> Back to results
        </button>

        <div className="product-detail-grid product-detail-grid-enhanced">
          <div className="product-gallery">
            <div className="product-gallery-main product-gallery-main-enhanced">
              <img src={validImages[activeImage]} alt={product.name} />
              {discount > 0 && <span className="product-gallery-badge">{discount}% OFF</span>}
            </div>

            <div className="product-gallery-thumbs">
              {validImages.map((img, idx) => (
                <button
                  key={img + idx}
                  type="button"
                  className={`product-gallery-thumb ${idx === activeImage ? 'active' : ''}`}
                  onClick={() => setActiveImage(idx)}
                >
                  <img src={img} alt={`${product.name} preview ${idx + 1}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="product-info product-info-enhanced">
            <div className="product-breadcrumb">
              <Link to="/">Home</Link>
              <HiChevronRight />
              <Link to={`/search?category=${encodeURIComponent(categoryName)}`}>{categoryName}</Link>
            </div>

            <div className="product-kicker-row">
              <span className="product-kicker">{categoryName}</span>
              {product.isFeatured && (
                <span className="product-kicker product-kicker-light">
                  <HiSparkles /> Featured
                </span>
              )}
            </div>

            <h1>{product.name}</h1>

            <div className="product-rating-section">
              <div className="product-rating-stars">{renderStars(Math.round(product.rating || 0))}</div>
              <span className="product-rating-value">{Number(product.rating || 0).toFixed(1)}</span>
              <span className="product-rating-count">({reviewCount} reviews)</span>
            </div>

            <div className="product-price-section">
              <span className="product-current-price">{currency(price)}</span>
              {comparePrice > price && (
                <>
                  <span className="product-compare-price">{currency(comparePrice)}</span>
                  <span className="product-discount-badge">Save {discount}%</span>
                </>
              )}
            </div>

            <div className="product-highlights">
              <div className="product-highlight">
                <HiTruck />
                <div>
                  <strong>Sold by {vendorName}</strong>
                  <span>Fast dispatch from trusted seller</span>
                </div>
              </div>
              <div className="product-highlight">
                <HiShieldCheck />
                <div>
                  <strong>Secure checkout</strong>
                  <span>Protected payments and verified delivery</span>
                </div>
              </div>
            </div>

            <div className={`product-stock ${inStock ? 'in-stock' : 'out-of-stock'}`}>
              {inStock ? (
                <>
                  <HiCheck /> In stock with {product.stock} unit{product.stock > 1 ? 's' : ''} available
                </>
              ) : (
                <>
                  <HiExclamation /> Currently out of stock
                </>
              )}
            </div>

            <div className="product-description product-description-preview">
              <p>{product.description}</p>
            </div>

            <div className="product-actions">
              <div className="product-qty-selector">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                >
                  <HiMinus />
                </button>
                <input readOnly value={quantity} />
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.min(Number(product.stock || 1), current + 1))}
                  disabled={!inStock}
                >
                  <HiPlus />
                </button>
              </div>

              <button className="btn btn-primary btn-add-cart" onClick={handleAddToCart} disabled={!inStock}>
                <HiShoppingCart /> Add to Cart
              </button>
              <button className="btn btn-secondary btn-buy-now" onClick={handleBuyNow} disabled={!inStock}>
                Buy Now
              </button>
              <button className="btn btn-outline-secondary" type="button" onClick={handleAddToWishlist}>
                <HiHeart /> Wishlist
              </button>
            </div>
          </div>
        </div>

        <div className="product-tabs">
          <div className="product-tabs-header">
            <button
              type="button"
              className={`product-tab ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              type="button"
              className={`product-tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
            </button>
          </div>

          <div className="product-tab-content product-tab-surface">
            {activeTab === 'description' ? (
              <div className="product-description-layout">
                <div className="product-description-card">
                  <h3>About this product</h3>
                  <p>{product.description}</p>
                </div>

                {specifications.length > 0 && (
                  <div className="product-specs product-description-card">
                    <h4>Specifications</h4>
                    <table>
                      <tbody>
                        {specifications.map((spec) => (
                          <tr key={`${spec.key}-${spec.value}`}>
                            <td>{spec.key}</td>
                            <td>{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="reviews-layout">
                {isAuthenticated ? (
                  <form onSubmit={handleReviewSubmit} className="review-form review-form-enhanced">
                    <h4>Write a review</h4>
                    <p className="review-form-note">Share your experience to help other buyers choose better.</p>

                    <div className="star-rating-input">
                      {renderStars(reviewForm.rating, true)}
                    </div>

                    <input
                      className="form-input"
                      placeholder="Review title"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
                    />

                    <textarea
                      className="form-input"
                      placeholder="What did you like or dislike?"
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                      rows="4"
                    />

                    <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <div className="review-login-note">
                    <p>
                      Please <Link to="/login">login</Link> to write a review.
                    </p>
                  </div>
                )}

                <div className="reviews-stream">
                  {product.reviews?.length ? (
                    product.reviews.map((review, index) => (
                      <div key={review._id || `${review.name}-${index}`} className="review-item">
                        <div className="review-header">
                          <div className="review-avatar">
                            {(review.name || review.user?.username || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div className="review-user-info">
                            <h5>{review.name || review.user?.username || review.user?.name || 'Anonymous'}</h5>
                            <span className="review-date">
                              {review.createdAt
                                ? new Date(review.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'Recent review'}
                            </span>
                          </div>
                        </div>
                        <div className="review-stars">{renderStars(Number(review.rating || 0))}</div>
                        {review.title ? <p className="review-title">{review.title}</p> : null}
                        <p className="review-comment">{review.comment || 'No additional comment shared.'}</p>
                      </div>
                    ))
                  ) : (
                    <div className="review-login-note">
                      <p>No reviews yet. Be the first to share your experience.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {similarProducts.length > 0 && (
          <div className="related-products-section">
            <div className="section-header">
              <h2>Similar Products</h2>
              <span className="view-all">
                <HiSparkles /> AI matched
              </span>
            </div>
            <div className="product-grid">
              {similarProducts.slice(0, 4).map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </div>
        )}

        {boughtTogetherProducts.length > 0 && (
          <div className="related-products-section">
            <div className="section-header">
              <h2>Frequently Bought Together</h2>
              <span className="view-all">
                <HiTruck /> Popular bundle
              </span>
            </div>
            <div className="product-grid">
              {boughtTogetherProducts.slice(0, 4).map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </div>
        )}

        {relatedProducts.length > 0 && (
          <div className="related-products-section">
            <div className="section-header">
              <h2>Related Products</h2>
              <Link to={`/search?category=${encodeURIComponent(categoryName)}`} className="view-all">
                View More
              </Link>
            </div>
            <div className="product-grid">
              {relatedProducts.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
