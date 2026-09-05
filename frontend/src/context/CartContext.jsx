import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/api.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

const storageKey = "ai-ecommerce-cart";

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setCartItems(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const syncCart = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data } = await api.get("/cart");
        setCartItems(
          data.map((item) => ({
            product: item.product,
            quantity: item.quantity,
          }))
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    syncCart();
  }, [user]);

  const addToCart = async (product, quantity = 1) => {
    if (user) {
      const { data } = await api.post("/cart", { productId: product._id, quantity });
      setCartItems(data.map((item) => ({ product: item.product, quantity: item.quantity })));
    } else {
      setCartItems((previous) => {
        const existing = previous.find((item) => item.product._id === product._id);
        if (existing) {
          return previous.map((item) =>
            item.product._id === product._id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...previous, { product, quantity }];
      });
    }

    toast.success(`${product.name} added to cart`);
  };

  const updateQuantity = async (productId, quantity) => {
    if (user) {
      const { data } = await api.put(`/cart/${productId}`, { quantity });
      setCartItems(data.map((item) => ({ product: item.product, quantity: item.quantity })));
      return;
    }

    setCartItems((previous) =>
      previous
        .map((item) => (item.product._id === productId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = async (productId) => {
    if (user) {
      const { data } = await api.delete(`/cart/${productId}`);
      setCartItems(data.map((item) => ({ product: item.product, quantity: item.quantity })));
    } else {
      setCartItems((previous) => previous.filter((item) => item.product._id !== productId));
    }
  };

  const clearCart = () => setCartItems([]);

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        cartCount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
