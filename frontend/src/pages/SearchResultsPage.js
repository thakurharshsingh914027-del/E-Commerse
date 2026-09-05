import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import {
  HiFilter,
  HiSortAscending,
  HiX,
  HiSearch,
  HiChevronLeft,
  HiChevronRight,
} from 'react-icons/hi';

const categories = [
  { label: 'Accessories', value: 'accessories' },
  { label: 'Cameras', value: 'camera' },
  { label: 'Components', value: 'components' },
  { label: 'Desktop PCs', value: 'desktop' },
  { label: 'Laptops', value: 'laptop' },
  { label: 'Monitors', value: 'monitor' },
  { label: 'Networking', value: 'networking' },
  { label: 'Office Equipment', value: 'office-equipment' },
];

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [minRating, setMinRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const limit = 12;

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const categoryLabel =
    categories.find((item) => item.value === category)?.label || category;

  useEffect(() => {
    if (category) {
      setSelectedCategories([category]);
    }
  }, [category]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (selectedCategories.length > 0) params.set('category', selectedCategories.join(','));
      if (priceRange.min) params.set('minPrice', priceRange.min);
      if (priceRange.max) params.set('maxPrice', priceRange.max);
      if (minRating > 0) params.set('rating', minRating);
      params.set('sort', sortBy);
      params.set('page', currentPage);
      params.set('limit', limit);

      const res = await API.get(`/api/products?${params.toString()}`);
      const d = res.data;
      setProducts(d?.products || (Array.isArray(d) ? d : []));
      setTotalResults(d?.total || (Array.isArray(d) ? d.length : 0));
    } catch (error) {
      console.error('Search failed:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [query, selectedCategories, priceRange, minRating, sortBy, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCategoryToggle = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: '', max: '' });
    setMinRating(0);
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleSort = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalResults / limit);

  const hasFilters = selectedCategories.length > 0 || priceRange.min || priceRange.max || minRating > 0;

  return (
    <div className="search-page fade-in">
      <div className="container">
        {/* Header */}
        <div className="search-page-header">
          <div>
            <h1>
              {query ? `Results for "${query}"` : category ? `${categoryLabel}` : 'All Products'}
              {totalResults > 0 && <span className="result-count"> ({totalResults} products)</span>}
            </h1>
          </div>
          <div className="search-sort">
            <HiSortAscending style={{ fontSize: '20px', color: '#636E72' }} />
            <select value={sortBy} onChange={handleSort}>
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          className="mobile-filter-toggle btn btn-outline btn-block"
          onClick={() => setShowFilters(!showFilters)}
        >
          <HiFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
          {hasFilters && ' (Active)'}
        </button>

        <div className="search-layout">
          {/* Filters Sidebar */}
          <aside className={`search-filters ${showFilters ? 'active' : ''}`}>
            <h3><HiFilter /> Filters</h3>

            {hasFilters && (
              <button className="filter-clear-btn" onClick={clearFilters}>
                <HiX /> Clear All Filters
              </button>
            )}

            {/* Categories */}
            <div className="filter-section">
              <h4>Categories</h4>
              {categories.map((cat) => (
                <label key={cat.value} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.value)}
                    onChange={() => handleCategoryToggle(cat.value)}
                  />
                  {cat.label}
                </label>
              ))}
            </div>

            {/* Price Range */}
            <div className="filter-section">
              <h4>Price Range</h4>
              <div className="price-range-inputs">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={priceRange.min}
                  onChange={(e) => {
                    setPriceRange({ ...priceRange, min: e.target.value });
                    setCurrentPage(1);
                  }}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={priceRange.max}
                  onChange={(e) => {
                    setPriceRange({ ...priceRange, max: e.target.value });
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {/* Rating */}
            <div className="filter-section">
              <h4>Rating</h4>
              {[4, 3, 2].map((r) => (
                <label key={r} className="filter-checkbox">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === r}
                    onChange={() => {
                      setMinRating(r);
                      setCurrentPage(1);
                    }}
                  />
                  {r}+ Stars ★
                </label>
              ))}
              <label className="filter-checkbox">
                <input
                  type="radio"
                  name="rating"
                  checked={minRating === 0}
                  onChange={() => {
                    setMinRating(0);
                    setCurrentPage(1);
                  }}
                />
                All Ratings
              </label>
            </div>
          </aside>

          {/* Results */}
          <div className="search-results">
            {loading ? (
              <div className="product-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton skeleton-img"></div>
                    <div className="skeleton skeleton-text title"></div>
                    <div className="skeleton skeleton-text medium"></div>
                    <div className="skeleton skeleton-text short"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="product-grid">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="search-pagination">
                    <button
                      className="pagination-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      <HiChevronLeft />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 2
                        );
                      })
                      .map((page, idx, arr) => (
                        <React.Fragment key={page}>
                          {idx > 0 && arr[idx - 1] !== page - 1 && (
                            <span style={{ padding: '0 8px', color: '#ADB5BD' }}>...</span>
                          )}
                          <button
                            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                    <button
                      className="pagination-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      <HiChevronRight />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <HiSearch style={{ fontSize: '64px' }} />
                <h3>No products found</h3>
                <p>Try adjusting your filters or search for something else.</p>
                <button className="btn btn-primary" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
