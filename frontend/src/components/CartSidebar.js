import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiX, HiPlus, HiMinus, HiShoppingBag, HiTrash } from 'react-icons/hi';

const CartSidebar = () => {
  const { cart, cartOpen, closeCart, updateCartQty, removeFromCart, getCartTotal, canShop } = useAuth();
  const navigate = useNavigate();

  const subtotal = getCartTotal();
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (!canShop) {
      toast.error('Only customer accounts can place orders.');
      return;
    }

    closeCart();
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`cart-overlay ${cartOpen ? 'active' : ''}`}
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className={`cart-sidebar ${cartOpen ? 'active' : ''}`}>
        <div className="cart-sidebar-header">
          <h3>
            <HiShoppingBag /> Shopping Cart
            <span className="cart-count">{cart.length}</span>
          </h3>
          <button className="cart-sidebar-close" onClick={closeCart}>
            <HiX />
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <HiShoppingBag />
              <h4>Your cart is empty</h4>
              <p>Looks like you haven't added anything to your cart yet.</p>
              <Link to="/" className="btn btn-primary" onClick={closeCart}>
                Continue Shopping
              </Link>
            </div>
          ) : (
            cart.map((item) => (
              <div className="cart-item" key={item.product._id}>
                <div className="cart-item-img">
                  <img
                    src={item.product.image || 'https://via.placeholder.com/80x80?text=No+Image'}
                    alt={item.product.name}
                  />
                </div>
                <div className="cart-item-details">
                  <div className="cart-item-name">{item.product.name}</div>
                  <div className="cart-item-price">₹{item.product.price.toLocaleString()}</div>
                  <div className="cart-item-qty">
                    <button onClick={() => updateCartQty(item.product._id, item.quantity - 1)}>
                      <HiMinus />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateCartQty(item.product._id, item.quantity + 1)}>
                      <HiPlus />
                    </button>
                  </div>
                </div>
                <button
                  className="cart-item-remove"
                  onClick={() => removeFromCart(item.product._id)}
                  title="Remove"
                >
                  <HiTrash />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-sidebar-footer">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="cart-summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
            </div>
            <div className="cart-summary-row total">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <button className="btn btn-primary btn-block" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
