import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import {
  HiLocationMarker,
  HiCreditCard,
  HiClipboardList,
  HiCheck,
} from 'react-icons/hi';

const CheckoutPage = () => {
  const { cart, user, getCartTotal, clearCart, canShop } = useAuth();
  const navigate = useNavigate();

  const [placing, setPlacing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    postalCode: '',
    phone: '',
  });

  const subtotal = getCartTotal();
  const shipping = subtotal > 500 ? 0 : 50;
  const tax = Math.round(subtotal * 0.02);
  const total = subtotal + shipping + tax;

  useEffect(() => {
    if (user && !canShop) {
      toast.error('Only customer accounts can place orders.');
      navigate(user.role?.toLowerCase() === 'admin' ? '/admin' : '/vendor/dashboard');
      return;
    }

    if (cart.length === 0) {
      navigate('/');
      return;
    }

    if (user?.address) {
      setShippingAddress({
        fullName: user.name || '',
        address: user.address.address || '',
        city: user.address.city || '',
        state: user.address.state || '',
        pincode: user.address.pincode || '',
        postalCode: user.address.postalCode || '',
        phone: user.phone || '',
      });
    }
  }, [cart, user, canShop, navigate]);

  const handleChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const { fullName, address, city, state, pincode, phone } = shippingAddress;
    if (!fullName || !address || !city || !state || !pincode || !phone) {
      toast.error('Please fill all required fields');
      return false;
    }
    if (!/^\d{6}$/.test(pincode)) {
      toast.error('Invalid PIN code');
      return false;
    }
    if (!/^\d{10}$/.test(phone)) {
      toast.error('Invalid phone number');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!canShop) {
      toast.error('Only customer accounts can place orders.');
      return;
    }
    if (!validateForm()) return;
    setPlacing(true);

    try {
      const orderData = {
        items: cart.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod: 'COD',
        totalAmount: total,
      };

      await API.post('/api/orders/place-cod-order', orderData);
      clearCart();
      toast.success('Order placed successfully 🎉');
      navigate('/orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Order failed');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
      <form onSubmit={handlePlaceOrder} className="form-row" style={{ gridTemplateColumns: '1fr 400px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: DETAILS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* SHIPPING CARD */}
          <div className="card">
            <div className="card-header">
              <h3>
                <HiLocationMarker style={{ color: 'var(--primary)', marginRight: '8px' }} />
                Shipping Details
              </h3>
            </div>
            <div className="card-body">
              <div className="form-row">
                <Input label="Full Name" name="fullName" required value={shippingAddress.fullName} onChange={handleChange} />
                <Input label="Phone Number" name="phone" required value={shippingAddress.phone} onChange={handleChange} />
              </div>
              
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Full Street Address <span className="required">*</span></label>
                <textarea 
                  className="form-textarea" 
                  name="address" 
                  value={shippingAddress.address} 
                  onChange={handleChange}
                  placeholder="Apartment, suite, unit, building, floor, etc."
                />
              </div>

              <div className="form-row">
                <Input label="City" name="city" required value={shippingAddress.city} onChange={handleChange} />
                <Input label="State" name="state" required value={shippingAddress.state} onChange={handleChange} />
              </div>

              <div className="form-row" style={{ marginTop: '16px' }}>
                <Input label="PIN Code" name="pincode" required value={shippingAddress.pincode} onChange={handleChange} />
                <Input label="Postal Code (Optional)" name="postalCode" value={shippingAddress.postalCode} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* PAYMENT CARD */}
          <div className="card">
            <div className="card-header">
              <h3>
                <HiCreditCard style={{ color: 'var(--primary)', marginRight: '8px' }} />
                Payment Method
              </h3>
            </div>
            <div className="card-body">
              <div className="form-radio active">
                <span style={{ fontSize: '20px' }}>💵</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '700', color: 'var(--primary)', margin: 0 }}>Cash on Delivery</p>
                  <p style={{ fontSize: '12px', margin: 0 }}>Pay when your package arrives</p>
                </div>
                <HiCheck size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SUMMARY */}
        <div className="card" style={{ position: 'sticky', top: '100px' }}>
          <div className="card-header">
            <h3>
              <HiClipboardList style={{ marginRight: '8px' }} />
              Order Summary
            </h3>
          </div>
          <div className="card-body" style={{ padding: '20px' }}>
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
              {cart.map((item) => (
                <div key={item.product._id} style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
                  <img 
                    src={item.product.image} 
                    alt="" 
                    style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} 
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', margin: 0 }}>{item.product.name}</p>
                    <p style={{ fontSize: '11px', color: 'var(--gray-500)', margin: 0 }}>Qty: {item.quantity}</p>
                  </div>
                  <p style={{ fontWeight: '700', fontSize: '14px' }}>₹{(item.product.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', fontSize: '14px' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span>Shipping</span>
                <span style={{ color: shipping === 0 ? 'var(--success)' : 'inherit' }}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span>Estimated Tax (2%)</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '800', marginTop: '10px', color: 'var(--gray-900)' }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary)' }}>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="card-footer" style={{ background: 'white' }}>
            <button 
              type="submit" 
              className="btn btn-primary btn-block btn-lg" 
              disabled={placing}
            >
              {placing ? 'Processing...' : `Place Order • ₹${total.toLocaleString()}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

/* Internal Helper Components using your CSS classes */
const Input = ({ label, required, ...props }) => (
  <div className="form-group">
    <label className="form-label">
      {label} {required && <span className="required">*</span>}
    </label>
    <input className="form-input" {...props} />
  </div>
);

export default CheckoutPage;

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import API from '../services/api';
// import toast from 'react-hot-toast';
// import { HiLocationMarker, HiCreditCard, HiClipboardList } from 'react-icons/hi';

// const CheckoutPage = () => {
//   const { cart, user, getCartTotal, clearCart } = useAuth();
//   const navigate = useNavigate();
//   const [placing, setPlacing] = useState(false);

//   const [shippingAddress, setShippingAddress] = useState({
//     fullName: '',
//     address: '',
//     city: '',
//     state: '',
//     zip: '',
//     phone: '',
//   });

//   const subtotal = getCartTotal();
//   const shipping = subtotal > 500 ? 0 : 50;
//   const tax = Math.round(subtotal * 0.02);
//   const total = subtotal + shipping + tax;

//   useEffect(() => {
//     if (cart.length === 0) {
//       navigate('/');
//       return;
//     }
//     if (user) {
//       setShippingAddress({
//         fullName: user.name || '',
//         address: user.address?.address || user.address || '',
//         city: user.address?.city || '',
//         state: user.address?.state || '',
//         zip: String(user.address?.zip || ''),
//         phone: String(user.phone || ''),
//       });
//     }
//   }, [cart, user, navigate]);

//   const handleChange = (e) => {
//     setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
//   };

//   const handlePlaceOrder = async (e) => {
//     e.preventDefault();
//     setPlacing(true);
//     try {
//       const orderData = {
//         items: cart.map((item) => ({
//           productId: item.product._id,
//           quantity: item.quantity,
//           price: item.product.price,
//           vendor: item.product.vendor,
//         })),
//         shippingAddress,
//         paymentMethod: 'COD',
//         totalAmount: total,
//       };

//       await API.post('/api/orders/place-cod-order', orderData);
//       clearCart();
//       toast.success('Order placed successfully!');
//       navigate('/my-orders');
//     } catch (err) {
//       toast.error('Transaction Failed');
//     } finally {
//       setPlacing(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 py-24 px-4">
//       <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8">

//         {/* LEFT */}
//         <form onSubmit={handlePlaceOrder} className="lg:col-span-8 space-y-6">
//           <div className="bg-white p-6 rounded-2xl shadow">
//             <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
//               <HiLocationMarker /> Shipping Details
//             </h2>

//             <div className="grid md:grid-cols-2 gap-4">
//               <input name="fullName" value={shippingAddress.fullName} onChange={handleChange} placeholder="Full Name" className="input" required />
//               <input name="phone" value={shippingAddress.phone} onChange={handleChange} placeholder="Phone" className="input" required />
//               <textarea name="address" value={shippingAddress.address} onChange={handleChange} placeholder="Address" className="input md:col-span-2" required />
//               <input name="city" value={shippingAddress.city} onChange={handleChange} placeholder="City" className="input" required />
//               <input name="state" value={shippingAddress.state} onChange={handleChange} placeholder="State" className="input" required />
//               <input name="zip" value={shippingAddress.zip} onChange={handleChange} placeholder="PIN Code" className="input" required />
//             </div>
//           </div>

//           <div className="bg-white p-6 rounded-2xl shadow">
//             <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
//               <HiCreditCard /> Payment Method
//             </h2>

//             <div className="p-4 border rounded-xl bg-green-50 flex justify-between items-center">
//               <span className="font-semibold">Cash on Delivery</span>
//               <span>💵</span>
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={placing}
//             className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-black to-gray-800 hover:from-orange-500 hover:to-orange-600 transition disabled:opacity-50"
//           >
//             {placing ? 'Placing Order...' : 'Place Order'}
//           </button>
//         </form>

//         {/* RIGHT */}
//         <div className="lg:col-span-4">
//           <div className="bg-white p-6 rounded-2xl shadow sticky top-24">
//             <h2 className="flex items-center gap-2 text-lg font-bold mb-4">
//               <HiClipboardList /> Order Summary
//             </h2>

//             <div className="space-y-4 max-h-64 overflow-y-auto">
//               {cart.map((item) => (
//                 <div key={item.product._id} className="flex gap-3">
//                   <img src={item.product.image} className="w-16 h-16 object-cover rounded" />
//                   <div>
//                     <p className="font-semibold text-sm">{item.product.name}</p>
//                     <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
//                     <p className="text-orange-600 font-bold">₹{item.product.price * item.quantity}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="mt-4 border-t pt-4 space-y-2 text-sm">
//               <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
//               <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
//               <div className="flex justify-between font-bold text-lg"><span>Total</span><span>₹{total}</span></div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Tailwind reusable input */}
//       <style>{`
//         .input {
//           width: 100%;
//           padding: 12px;
//           border: 1px solid #e5e7eb;
//           border-radius: 10px;
//           background: #f9fafb;
//           outline: none;
//         }
//         .input:focus {
//           border-color: orange;
//           background: white;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default CheckoutPage;
