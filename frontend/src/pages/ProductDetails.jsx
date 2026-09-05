import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import Loader from "../components/Loader.jsx";
import RecommendationSection from "../components/RecommendationSection.jsx";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [boughtTogether, setBoughtTogether] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const [{ data: productData }, { data: similarData }, { data: togetherData }] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/recommendations/similar/${id}`),
          api.get(`/recommendations/frequently-bought-together/${id}`),
        ]);

        setProduct(productData);
        setSimilarProducts(similarData.products || []);
        setBoughtTogether(togetherData.products || []);

        if (user) {
          await api.post("/recommendations/activity", { productId: id, actionType: "view" });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) {
      toast.error("Please login to save likes");
      return;
    }

    try {
      await api.post("/recommendations/activity", { productId: id, actionType: "like" });
      toast.success("Product liked");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save like");
    }
  };

  if (loading) {
    return <Loader fullScreen label="Loading product intelligence" />;
  }

  if (!product) {
    return (
      <div className="page-shell">
        <div className="panel p-10 text-center">
          <h1 className="text-2xl font-black text-slate-950">Product not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell space-y-10">
      <section className="panel overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="bg-slate-100 p-6">
            <img src={product.image} alt={product.name} className="h-full max-h-[460px] w-full rounded-[2rem] object-cover" />
          </div>
          <div className="space-y-6 p-6 lg:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {product.category}
              </span>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
                {product.brand}
              </span>
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-950">{product.name}</h1>
              <p className="mt-4 text-base leading-7 text-slate-600">{product.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="grid gap-4 rounded-[2rem] bg-slate-950 p-6 text-white sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Price</p>
                <p className="mt-2 text-3xl font-black">Rs. {product.price.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Rating</p>
                <p className="mt-2 text-3xl font-black">★ {product.rating.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Stock</p>
                <p className="mt-2 text-3xl font-black">{product.stock}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => addToCart(product, 1)} className="btn-primary">
                Add to Cart
              </button>
              <button type="button" onClick={handleLike} className="btn-secondary">
                Like Product
              </button>
            </div>
          </div>
        </div>
      </section>

      <RecommendationSection
        title="Similar Products"
        subtitle="Calculated from tags, category, description, price, and behavior signals"
        products={similarProducts}
        onAddToCart={addToCart}
      />

      <RecommendationSection
        title="Frequently Bought Together"
        subtitle="Products that commonly appear in the same order history"
        products={boughtTogether}
        onAddToCart={addToCart}
      />
    </div>
  );
};

export default ProductDetails;
