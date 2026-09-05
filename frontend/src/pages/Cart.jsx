import { useState } from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const Cart = () => {
  const { user } = useAuth();
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please login to continue to checkout");
      return;
    }

    if (!cartItems.length) {
      toast.error("Your cart is empty");
      return;
    }

    setProcessing(true);
    try {
      await api.post("/orders", {
        items: cartItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod: "cod",
      });
      clearCart();
      setCompleted(true);
      toast.success("Order placed successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Checkout failed");
    } finally {
      setProcessing(false);
    }
  };

  if (completed) {
    return <Navigate to="/orders" replace />;
  }

  return (
    <div className="page-shell space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Cart</p>
        <h1 className="text-4xl font-black text-slate-950">Review your shopping bag</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.product._id} className="panel flex flex-col gap-4 p-5 sm:flex-row">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="h-28 w-full rounded-3xl object-cover sm:w-36"
              />
              <div className="flex flex-1 flex-col justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-950">{item.product.name}</h3>
                  <p className="text-sm text-slate-500">{item.product.category}</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="btn-secondary px-4 py-2"
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="text-sm font-semibold text-slate-700">{item.quantity}</span>
                    <button
                      type="button"
                      className="btn-secondary px-4 py-2"
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-black text-slate-950">
                      Rs. {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                    <button
                      type="button"
                      className="text-sm font-semibold text-rose-600"
                      onClick={() => removeFromCart(item.product._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!cartItems.length && (
            <div className="panel p-10 text-center text-slate-600">Your cart is empty.</div>
          )}
        </div>

        <aside className="panel h-fit p-6">
          <h2 className="text-2xl font-black text-slate-950">Checkout</h2>
          <div className="mt-6 space-y-4">
            {["fullName", "email", "phone", "address", "city", "state", "pincode"].map((field) => (
              <input
                key={field}
                className="input"
                placeholder={field.replace(/([A-Z])/g, " $1")}
                value={shippingAddress[field]}
                onChange={(event) =>
                  setShippingAddress((previous) => ({
                    ...previous,
                    [field]: event.target.value,
                  }))
                }
              />
            ))}
          </div>
          <div className="mt-6 rounded-[2rem] bg-slate-950 p-5 text-white">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Items</span>
              <span>{cartItems.length}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-2xl font-black">
              <span>Total</span>
              <span>Rs. {cartTotal.toLocaleString()}</span>
            </div>
          </div>
          <button type="button" className="btn-primary mt-6 w-full" disabled={processing} onClick={handleCheckout}>
            {processing ? "Placing order..." : "Checkout"}
          </button>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
