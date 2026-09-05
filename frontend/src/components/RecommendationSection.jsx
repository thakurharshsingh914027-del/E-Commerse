import ProductCard from "./ProductCard.jsx";

const RecommendationSection = ({ title, subtitle, products, onAddToCart }) => {
  if (!products?.length) return null;

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-950">{title}</h2>
          {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} onAddToCart={onAddToCart} />
        ))}
      </div>
    </section>
  );
};

export default RecommendationSection;
