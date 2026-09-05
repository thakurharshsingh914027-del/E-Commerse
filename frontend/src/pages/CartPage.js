import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiArrowLeft,
  HiCheckCircle,
  HiMinus,
  HiPlus,
  HiShieldCheck,
  HiShoppingBag,
  HiShoppingCart,
  HiTrash,
  HiTruck,
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const currency = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;

const extractImageUrl = (img) => {
  if (!img) return 'https://placehold.co/320x320/e2e8f0/64748b?text=No+Image';
  if (img.startsWith('http')) return img;
  return `http://127.0.0.1:5000${img}`;
};

const CartPage = () => {
  const { cart, updateCartQty, removeFromCart, getCartTotal, canShop } = useAuth();
  const navigate = useNavigate();

  const subtotal = getCartTotal();
  const shipping = subtotal > 500 ? 0 : 50;
  const tax = Math.round(subtotal * 0.02);
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    if (!canShop) {
      toast.error('Only customer accounts can place orders.');
      return;
    }

    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page fade-in">
        <div className="container">
          <div className="cart-empty-state">
            <div className="cart-empty-icon">
              <HiShoppingCart />
            </div>
            <h1>Your cart is empty</h1>
            <p>Looks like you have not added anything yet. Start exploring and build your perfect setup.</p>
            <Link to="/" className="btn btn-primary">
              <HiShoppingBag /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page fade-in">
      <div className="container">
        <button onClick={() => navigate(-1)} className="product-detail-back">
          <HiArrowLeft /> Continue Shopping
        </button>

        <div className="cart-header">
          <div>
            <h1>Shopping Cart</h1>
            <p>{cart.length} item{cart.length > 1 ? 's' : ''} ready for checkout</p>
          </div>
          <div className="cart-header-note">
            <HiShieldCheck />
            <span>Secure checkout and protected payments</span>
          </div>
        </div>

        <div className="cart-layout">
          <div className="cart-list">
            {cart.map((item) => {
              const product = item.product;
              const lineTotal = Number(product.price || 0) * item.quantity;
              const category = typeof product.category === 'string' ? product.category : 'General';

              return (
                <div key={product._id} className="cart-card">
                  <button
                    type="button"
                    className="cart-remove-btn"
                    onClick={() => removeFromCart(product._id)}
                    aria-label={`Remove ${product.name}`}
                  >
                    <HiTrash />
                  </button>

                  <div
                    className="cart-card-image"
                    onClick={() => navigate(`/product/${product._id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        navigate(`/product/${product._id}`);
                      }
                    }}
                  >
                    <img src={extractImageUrl(product.image)} alt={product.name} />
                  </div>

                  <div className="cart-card-body">
                    <div className="cart-card-copy">
                      <span className="cart-card-tag">{category}</span>
                      <h3 onClick={() => navigate(`/product/${product._id}`)}>{product.name}</h3>
                      <p>{product.vendor?.username ? `Sold by ${product.vendor.username}` : 'Trusted seller'}</p>
                    </div>

                    <div className="cart-card-meta">
                      <div className="cart-card-price">
                        <strong>{currency(product.price)}</strong>
                        <span>{currency(lineTotal)}</span>
                      </div>

                      <div className="cart-item-qty cart-item-qty-lg">
                        <button onClick={() => updateCartQty(product._id, item.quantity - 1)}>
                          <HiMinus />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateCartQty(product._id, item.quantity + 1)}>
                          <HiPlus />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="order-summary cart-summary-card">
            <h3>Order Summary</h3>
            <div className="order-summary-row">
              <span>Subtotal</span>
              <span>{currency(subtotal)}</span>
            </div>
            <div className="order-summary-row">
              <span>Shipping</span>
              <span style={{ color: shipping === 0 ? 'var(--success)' : 'inherit' }}>
                {shipping === 0 ? 'Free' : currency(shipping)}
              </span>
            </div>
            <div className="order-summary-row">
              <span>Tax</span>
              <span>{currency(tax)}</span>
            </div>
            <div className="order-summary-row total">
              <span>Total</span>
              <span>{currency(total)}</span>
            </div>

            <div className="cart-summary-badges">
              <div className="cart-summary-badge">
                <HiTruck />
                <span>Fast delivery support</span>
              </div>
              <div className="cart-summary-badge">
                <HiCheckCircle />
                <span>Easy returns on eligible items</span>
              </div>
            </div>

            {shipping > 0 ? (
              <p className="cart-shipping-note">
                Add {currency(500 - subtotal)} more to unlock free shipping.
              </p>
            ) : (
              <p className="cart-shipping-note success">You have unlocked free shipping.</p>
            )}

            <button className="btn btn-primary btn-block" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
