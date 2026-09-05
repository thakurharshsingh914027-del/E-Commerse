import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiCamera,
  HiChevronLeft,
  HiChevronRight,
  HiChip,
  HiGlobe,
  HiLightningBolt,
  HiDesktopComputer,
  HiOfficeBuilding,
  HiSearch,
  HiShieldCheck,
  HiSparkles,
} from 'react-icons/hi';
import { FiHeadphones, FiMonitor } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const categories = [
  { label: 'Laptops', value: 'laptop', icon: HiChip },
  { label: 'Monitors', value: 'monitor', icon: FiMonitor },
  { label: 'Components', value: 'components', icon: HiChip },
  { label: 'Desktop PCs', value: 'desktop', icon: HiDesktopComputer },
  { label: 'Networking', value: 'networking', icon: HiLightningBolt },
  { label: 'Cameras', value: 'camera', icon: HiCamera },
  { label: 'Accessories', value: 'accessories', icon: FiHeadphones },
  { label: 'Office Gear', value: 'office-equipment', icon: HiOfficeBuilding },
];

const heroSlides = [
  {
    eyebrow: 'Top Picks',
    title: 'Upgrade Your Setup With Smarter Tech',
    subtitle:
      'Shop laptops, monitors, accessories, and creator gear from multiple trusted vendors in one place.',
    accent: 'orange',
    image:
      'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1600&q=80',
  },
  {
    eyebrow: 'Fresh Arrivals',
    title: 'New Launches For Work, Play, And Study',
    subtitle:
      'Discover recently added devices and daily-use essentials curated for modern desks and home offices.',
    accent: 'blue',
    image:
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1600&q=80',
  },
  {
    eyebrow: 'Best Deals',
    title: 'Big Value Across Every Tech Category',
    subtitle:
      'Compare featured products, trending picks, and limited-time offers without hopping between stores.',
    accent: 'green',
    image:
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80',
  },
  {
    eyebrow: 'Gaming Zone',
    title: 'Performance Gear For Serious Play',
    subtitle:
      'Find graphics cards, fast monitors, keyboards, and battle-ready desktops from specialist vendors.',
    accent: 'blue',
    image:
      'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=1600&q=80',
  },
  {
    eyebrow: 'Creator Studio',
    title: 'Tools For Editing, Streaming, And Design',
    subtitle:
      'Explore cameras, creator laptops, displays, and accessories built for content-heavy workflows.',
    accent: 'green',
    image:
      'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=1600&q=80',
  },
  {
    eyebrow: 'Office Essentials',
    title: 'Smarter Workstations For Every Team',
    subtitle:
      'Build a cleaner desk with printers, scanners, networking gear, monitors, and daily office hardware.',
    accent: 'orange',
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80',
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [user?._id, isAuthenticated]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const requests = [
        API.get('/api/products/featured'),
        API.get('/api/products?sort=newest&limit=8'),
        API.get('/api/recommendations/trending'),
      ];

      if (isAuthenticated && (user?._id || user?.id)) {
        requests.push(API.get(`/api/recommendations/user/${user._id || user.id}`));
      }

      const [featuredRes, newRes, trendingRes, recommendedRes] = await Promise.allSettled(requests);

      if (featuredRes.status === 'fulfilled') {
        const data = featuredRes.value.data;
        setFeaturedProducts(data?.products || (Array.isArray(data) ? data : []));
      }

      if (newRes.status === 'fulfilled') {
        const data = newRes.value.data;
        setNewArrivals(data?.products || (Array.isArray(data) ? data : []));
      }

      if (trendingRes.status === 'fulfilled') {
        const data = trendingRes.value.data;
        setTrendingProducts(data?.products || []);
      }

      if (recommendedRes?.status === 'fulfilled') {
        const data = recommendedRes.value.data;
        setRecommendedProducts(data?.products || []);
      } else {
        setRecommendedProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/search?category=${encodeURIComponent(categoryName)}`);
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();

    const email = newsletterEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Enter a valid email address');
      return;
    }

    setNewsletterSubmitting(true);
    try {
      await API.post('/api/form/contact', {
        username: 'Newsletter Subscriber',
        email,
        message: 'Newsletter subscription request from homepage',
      });
      toast.success('Email submitted successfully');
      setNewsletterEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit email');
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  const goToPreviousSlide = () => {
    setActiveSlide((current) => (current === 0 ? heroSlides.length - 1 : current - 1));
  };

  const goToNextSlide = () => {
    setActiveSlide((current) => (current + 1) % heroSlides.length);
  };

  const currentSlide = heroSlides[activeSlide];

  return (
    <div className="fade-in">
      <section
        className={`hero hero-${currentSlide.accent}`}
        style={{ '--hero-image': `url(${currentSlide.image})` }}
      >
        <button
          type="button"
          className="hero-nav hero-nav-left"
          onClick={goToPreviousSlide}
          aria-label="Previous banner slide"
        >
          <HiChevronLeft />
        </button>

        <button
          type="button"
          className="hero-nav hero-nav-right"
          onClick={goToNextSlide}
          aria-label="Next banner slide"
        >
          <HiChevronRight />
        </button>

        <div className="hero-content">
          <span className="hero-eyebrow">{currentSlide.eyebrow}</span>
          <h1>{currentSlide.title}</h1>
          <p className="hero-subtitle">{currentSlide.subtitle}</p>

          <form className="hero-search" onSubmit={handleHeroSearch}>
            <input
              type="text"
              placeholder="Search for products, brands, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">
              <HiSearch /> Search
            </button>
          </form>

          <div className="hero-badges">
            <div className="hero-badge">
              <HiGlobe /> 10,000+ Products
            </div>
            <div className="hero-badge">
              <HiShieldCheck /> Secure Payments
            </div>
            <div className="hero-badge">
              <HiSparkles /> AI Powered
            </div>
          </div>

          <div className="hero-dots" aria-label="Banner slide navigation">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                className={`hero-dot ${index === activeSlide ? 'active' : ''}`}
                onClick={() => setActiveSlide(index)}
                aria-label={`Show slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="categories-bar">
        <div className="container">
          <div className="categories-bar-header">
            <div>
              <h2>Shop by Category</h2>
              <p>Browse the core product categories powering your setup.</p>
            </div>
          </div>
          <div className="categories-scroll">
            {categories.map((cat) => {
              const Icon = cat.icon;

              return (
                <div
                  key={cat.value}
                  className="category-item"
                  onClick={() => handleCategoryClick(cat.value)}
                >
                  <span className="category-icon">
                    <Icon />
                  </span>
                  <span className="category-name">{cat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ padding: '48px 0' }}>
        <div className="container">
          <div className="section-header">
            <h2>Trending Products</h2>
            <a href="/search?sort=popular" className="view-all">
              View All <HiSearch />
            </a>
          </div>

          {loading ? (
            <div className="product-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton skeleton-img"></div>
                  <div className="skeleton skeleton-text title"></div>
                  <div className="skeleton skeleton-text medium"></div>
                  <div className="skeleton skeleton-text short"></div>
                </div>
              ))}
            </div>
          ) : trendingProducts.length > 0 ? (
            <div className="product-grid">
              {trendingProducts.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No trending recommendations available right now.</p>
            </div>
          )}
        </div>
      </section>

      <section style={{ padding: '0 0 48px' }}>
        <div className="container">
          <div className="section-header">
            <h2>New Arrivals</h2>
            <a href="/search?sort=newest" className="view-all">
              View All <HiSearch />
            </a>
          </div>

          {loading ? (
            <div className="product-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton skeleton-img"></div>
                  <div className="skeleton skeleton-text title"></div>
                  <div className="skeleton skeleton-text medium"></div>
                  <div className="skeleton skeleton-text short"></div>
                </div>
              ))}
            </div>
          ) : newArrivals.length > 0 ? (
            <div className="product-grid">
              {newArrivals.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No new arrivals at the moment.</p>
            </div>
          )}
        </div>
      </section>

      <section style={{ padding: '0 0 48px' }}>
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <a href="/search?sort=featured" className="view-all">
              View All <HiSearch />
            </a>
          </div>

          {loading ? (
            <div className="product-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton skeleton-img"></div>
                  <div className="skeleton skeleton-text title"></div>
                  <div className="skeleton skeleton-text medium"></div>
                  <div className="skeleton skeleton-text short"></div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="product-grid">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No featured products available right now.</p>
            </div>
          )}
        </div>
      </section>

      {isAuthenticated && (
        <section style={{ padding: '0 0 48px' }}>
          <div className="container">
            <div className="section-header">
              <h2>Recommended For You</h2>
              <span className="view-all">
                <HiSparkles /> Based on your activity
              </span>
            </div>

            {loading ? (
              <div className="product-grid">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton skeleton-img"></div>
                    <div className="skeleton skeleton-text title"></div>
                    <div className="skeleton skeleton-text medium"></div>
                    <div className="skeleton skeleton-text short"></div>
                  </div>
                ))}
              </div>
            ) : recommendedProducts.length > 0 ? (
              <div className="product-grid">
                {recommendedProducts.slice(0, 8).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Browse a few products first and your personalized recommendations will appear here.</p>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="why-shopmart">
        <div className="container">
          <h2>Why Shop with ShopMart?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon orange">
                <HiGlobe />
              </div>
              <h3>Multiple Vendors</h3>
              <p>Shop from hundreds of trusted vendors across India. Compare prices and find the best deals.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon green">
                <HiShieldCheck />
              </div>
              <h3>Secure Payments</h3>
              <p>Your transactions are 100% secure with encrypted payments and buyer protection guarantee.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon blue">
                <HiSparkles />
              </div>
              <h3>AI Assistance</h3>
              <p>Get personalized recommendations and instant support from our AI-powered shopping assistant.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="newsletter">
        <div className="container">
          <h2>Stay Updated</h2>
          <p>Subscribe to our newsletter for exclusive deals and new arrivals</p>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
            />
            <button type="submit" disabled={newsletterSubmitting}>
              {newsletterSubmitting ? 'Submitting...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
