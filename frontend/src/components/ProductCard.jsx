import { Link } from "react-router-dom";

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-glow">
      <Link to={`/products/${product._id}`} className="block overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-4">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {product.category}
          </span>
          <span className="text-sm font-semibold text-amber-500">★ {product.rating.toFixed(1)}</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-950">{product.name}</h3>
          <p className="mt-2 min-h-10 text-sm text-slate-600">{product.description}</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{product.brand}</p>
            <p className="text-2xl font-black text-slate-950">Rs. {product.price.toLocaleString()}</p>
          </div>
          <button type="button" onClick={() => onAddToCart(product)} className="btn-primary">
            Add
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
