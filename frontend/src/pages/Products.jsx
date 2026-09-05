import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import SearchFilter from "../components/SearchFilter.jsx";
import Loader from "../components/Loader.jsx";
import api from "../api/api.js";
import { useCart } from "../context/CartContext.jsx";

const defaultFilters = {
  search: "",
  category: "all",
  sortBy: "latest",
  minPrice: "",
  maxPrice: "",
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    ...defaultFilters,
    category: searchParams.get("category") || "all",
    search: searchParams.get("search") || "",
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [filters]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products?${queryString}`);
        setProducts(data.products || []);
        setCategories(data.categories || []);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [queryString]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSearchParams(queryString);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setSearchParams("");
  };

  return (
    <div className="page-shell space-y-8">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Marketplace</p>
        <h1 className="text-4xl font-black text-slate-950">Discover products built around your taste</h1>
      </div>

      <SearchFilter
        filters={filters}
        categories={categories}
        onChange={(key, value) => setFilters((previous) => ({ ...previous, [key]: value }))}
        onSubmit={handleSubmit}
        onReset={handleReset}
      />

      {loading ? (
        <Loader fullScreen={false} label="Loading products" />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} onAddToCart={addToCart} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
