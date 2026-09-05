import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import RecommendationSection from "../components/RecommendationSection.jsx";
import Loader from "../components/Loader.jsx";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const Home = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [trending, setTrending] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      try {
        const [{ data: trendingData }, { data: productsData }] = await Promise.all([
          api.get("/recommendations/trending"),
          api.get("/products?limit=8"),
        ]);

        setTrending(trendingData.products || []);
        setCategories((productsData.categories || []).slice(0, 6));

        if (user?._id) {
          const { data } = await api.get(`/recommendations/user/${user._id}`);
          setRecommended(data.products || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, [user]);

  if (loading) {
    return <Loader fullScreen label="Curating smart product picks" />;
  }

  return (
    <div className="page-shell space-y-10">
      <section className="overflow-hidden rounded-[2.5rem] bg-hero px-6 py-10 text-white shadow-glow sm:px-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em]">
              AI-Powered Commerce
            </span>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
                Smarter product discovery for shoppers who hate endless scrolling.
              </h1>
              <p className="max-w-2xl text-base text-slate-200 sm:text-lg">
                Explore trending gear, behavior-based recommendations, and frequently bought together bundles
                powered by a local ML engine.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950">
                Shop now
              </Link>
              <Link
                to={user ? "/orders" : "/register"}
                className="rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white"
              >
                {user ? "View orders" : "Create account"}
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {trending.slice(0, 4).map((product) => (
              <div key={product._id} className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{product.category}</p>
                <h3 className="mt-2 text-lg font-bold">{product.name}</h3>
                <p className="mt-4 text-2xl font-black">Rs. {product.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {categories.map((category) => (
          <Link
            key={category}
            to={`/products?category=${encodeURIComponent(category)}`}
            className="panel p-5 text-center transition hover:-translate-y-1"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Category</p>
            <h3 className="mt-2 text-lg font-bold text-slate-950">{category}</h3>
          </Link>
        ))}
      </section>

      <RecommendationSection
        title="Trending Products"
        subtitle="Ranked by sales, ratings, and recent shopper activity"
        products={trending}
        onAddToCart={addToCart}
      />

      {user && (
        <RecommendationSection
          title="Recommended For You"
          subtitle="Personalized using your views, likes, cart history, and purchases"
          products={recommended}
          onAddToCart={addToCart}
        />
      )}

      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-950">Fresh Finds</h2>
            <p className="text-sm text-slate-600">A polished grid inspired by modern marketplace storefronts.</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-teal-700">
            Browse all
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {trending.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} onAddToCart={addToCart} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
