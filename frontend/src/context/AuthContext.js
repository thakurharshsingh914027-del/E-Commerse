import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const normalizeUser = (userData) => {
  if (!userData) return null;

  const fallbackName =
    userData.username ||
    userData.name ||
    userData.fullName ||
    (userData.email ? userData.email.split('@')[0] : '');

  return {
    ...userData,
    username: fallbackName,
    name: fallbackName,
  };
};

const canShop = (userData) => {
  if (!userData) return true;
  return userData.role?.toLowerCase() === 'customer';
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ Load cart
  useEffect(() => {
    const savedCart = localStorage.getItem('shopmart_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem('shopmart_cart');
      }
    }
  }, []);

  // ✅ Save cart
  useEffect(() => {
    localStorage.setItem('shopmart_cart', JSON.stringify(cart));
  }, [cart]);

  // ✅ Check auth
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await API.get('/api/auth/me');
          const userData = res.data?.user || res.data?.data || res.data;
          setUser(normalizeUser(userData));
        } catch {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // ✅ LOGIN
  const login = async (email, password) => {
    try {
      const res = await API.post('/api/auth/login', { email, password });

      const token = res.data?.token;
      const userData = normalizeUser(res.data?.user);

      if (token) localStorage.setItem('token', token);
      if (userData) setUser(userData);

      toast.success(`Welcome back, ${userData?.username || userData?.name || 'User'}!`);

      const role = userData?.role?.toLowerCase();

      if (role === 'admin') navigate('/admin/');
      else if (role === 'vendor') navigate('/vendor/dashboard');
      else navigate('/');

      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  // ✅ REGISTER (FIXED)
  const register = async (data) => {
    try {
      const payload = {
        username: data.name || data.username, // ✅ FIX
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: data.role?.toLowerCase(), // ✅ FIX
      };

      const res = await API.post('/api/auth/register', payload);

      const token = res.data?.token;
      const userData = normalizeUser(res.data?.user);

      if (token && userData) {
        localStorage.setItem('token', token);
        setUser(userData);

        toast.success('Registration successful!');

        const role = userData?.role?.toLowerCase();
        if (role === 'admin') navigate('/admin');
        else if (role === 'vendor') navigate('/vendor/dashboard');
        else navigate('/');
      } else {
        setUser(null);
        toast.success(res.data?.message || 'Registration successful! Please login.');
        navigate('/login');
      }

      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  // ✅ LOGOUT
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('shopmart_cart');
    setUser(null);
    setCart([]);
    toast.success('Logged out successfully');
    navigate('/');
  }, [navigate]);

  // ✅ UPDATE PROFILE
  const updateProfile = async (data) => {
    try {
      const res = await API.patch('/api/auth/update-profile', data);
      const updatedUser = normalizeUser(res.data?.user || res.data?.data || res.data);
      setUser(updatedUser);
      toast.success('Profile updated');
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      throw error;
    }
  };

  // ✅ CART FUNCTIONS
  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const toggleCart = useCallback(() => setCartOpen(prev => !prev), []);

  const addToCart = useCallback((product, qty = 1) => {
    if (!canShop(user)) {
      toast.error('Admin and vendor accounts cannot shop. Please login with a customer account.');
      return;
    }

    setCart(prev => {
      const index = prev.findIndex(item => item.product._id === product._id);

      if (index >= 0) {
        const updated = [...prev];
        updated[index].quantity += qty;
        toast.success(`${product.name} updated`);
        return updated;
      }

      toast.success(`${product.name} added`);
      return [...prev, { product, quantity: qty }];
    });

    setCartOpen(true);
  }, [user]);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(item => item.product._id !== productId));
  }, []);

  const updateCartQty = useCallback((productId, qty) => {
    if (qty < 1) return removeFromCart(productId);

    setCart(prev =>
      prev.map(item =>
        item.product._id === productId
          ? { ...item, quantity: qty }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem('shopmart_cart');
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [cart]);

  const getCartCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // ✅ ROLE CHECKS (FIXED)
  const isAuthenticated = !!user;
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isVendor = user?.role?.toLowerCase() === 'vendor';
  const isCustomer = user?.role?.toLowerCase() === 'customer';
  const canCurrentUserShop = canShop(user);

  const value = {
    user,
    setUser,
    loading,
    cart,
    cartOpen,
    login,
    register,
    logout,
    updateProfile,
    openCart,
    closeCart,
    toggleCart,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    getCartTotal,
    getCartCount,
    isAuthenticated,
    isAdmin,
    isVendor,
    isCustomer,
    canShop: canCurrentUserShop,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import API from '../services/api';
// import toast from 'react-hot-toast';

// const AuthContext = createContext(null);

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [cart, setCart] = useState([]);
//   const [cartOpen, setCartOpen] = useState(false);
//   const navigate = useNavigate();

//   // Load cart from localStorage
//   useEffect(() => {
//     const savedCart = localStorage.getItem('shopmart_cart');
//     if (savedCart) {
//       try {
//         setCart(JSON.parse(savedCart));
//       } catch (e) {
//         localStorage.removeItem('shopmart_cart');
//       }
//     }
//   }, []);

//   // Save cart to localStorage
//   useEffect(() => {
//     localStorage.setItem('shopmart_cart', JSON.stringify(cart));
//   }, [cart]);

//   // Check auth on mount
//   useEffect(() => {
//     const checkAuth = async () => {
//       const token = localStorage.getItem('token');
//       if (token) {
//         try {
//           const res = await API.get('/api/auth/me');
//           const userData = res.data?.user || res.data?.data || res.data;
//           setUser(userData);
//         } catch (error) {
//           localStorage.removeItem('token');
//           setUser(null);
//         }
//       }
//       setLoading(false);
//     };
//     checkAuth();
//   }, []);

//   const login = async (email, password) => {
//     try {
//       const res = await API.post('/api/auth/login', { email, password });
//       const token = res.data?.token;
//       const userData = res.data?.user;
//       if (token) localStorage.setItem('token', token);
//       if (userData) setUser(userData);
//       toast.success(`Welcome back, ${userData?.name || 'User'}!`);
      
//       // Redirect based on role
//       if (userData?.role === 'Admin') navigate('/admin');
//       else if (userData?.role === 'Vendor') navigate('/vendor/dashboard');
//       else navigate('/');
      
//       return res.data;
//     } catch (error) {
//       const message = error.response?.data?.message || 'Login failed. Please try again.';
//       toast.error(message);
//       throw error;
//     }
//   };

//   const register = async (data) => {
//     try {
//       const res = await API.post('/api/auth/register', data);
//       const token = res.data?.token;
//       const userData = res.data?.user;
//       if (token) localStorage.setItem('token', token);
//       if (userData) setUser(userData);
//       toast.success('Registration successful! Welcome to ShopMart!');
      
//       if (userData?.role === 'Admin') navigate('/admin');
//       else if (userData?.role === 'Vendor') navigate('/vendor/dashboard');
//       else navigate('/');
      
//       return res.data;
//     } catch (error) {
//       const message = error.response?.data?.message || 'Registration failed. Please try again.';
//       toast.error(message);
//       throw error;
//     }
//   };

//   const logout = useCallback(() => {
//     localStorage.removeItem('token');
//     setUser(null);
//     setCart([]);
//     localStorage.removeItem('shopmart_cart');
//     toast.success('Logged out successfully');
//     navigate('/');
//   }, [navigate]);

//   const updateProfile = async (data) => {
//     try {
//       const res = await API.put('/api/auth/profile', data);
//       setUser(res.data?.user || res.data?.data || res.data);
//       toast.success('Profile updated successfully');
//       return res.data;
//     } catch (error) {
//       const message = error.response?.data?.message || 'Failed to update profile.';
//       toast.error(message);
//       throw error;
//     }
//   };

//   const openCart = useCallback(() => setCartOpen(true), []);
//   const closeCart = useCallback(() => setCartOpen(false), []);
//   const toggleCart = useCallback(() => setCartOpen(prev => !prev), []);

//   const addToCart = useCallback((product, qty = 1) => {
//     setCart(prevCart => {
//       const existingIndex = prevCart.findIndex(item => item.product._id === product._id);
//       if (existingIndex >= 0) {
//         const updated = [...prevCart];
//         updated[existingIndex] = {
//           ...updated[existingIndex],
//           quantity: updated[existingIndex].quantity + qty,
//         };
//         toast.success(`${product.name} quantity updated`);
//         return updated;
//       } else {
//         toast.success(`${product.name} added to cart`);
//         return [...prevCart, { product, quantity: qty }];
//       }
//     });
//     setCartOpen(true);
//   }, []);

//   const removeFromCart = useCallback((productId) => {
//     setCart(prevCart => {
//       const item = prevCart.find(item => item.product._id === productId);
//       if (item) {
//         toast.success(`${item.product.name} removed from cart`);
//       }
//       return prevCart.filter(item => item.product._id !== productId);
//     });
//   }, []);

//   const updateCartQty = useCallback((productId, qty) => {
//     if (qty < 1) {
//       removeFromCart(productId);
//       return;
//     }
//     setCart(prevCart =>
//       prevCart.map(item =>
//         item.product._id === productId ? { ...item, quantity: qty } : item
//       )
//     );
//   }, [removeFromCart]);

//   const clearCart = useCallback(() => {
//     setCart([]);
//     localStorage.removeItem('shopmart_cart');
//   }, []);

//   const getCartTotal = useCallback(() => {
//     return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
//   }, [cart]);

//   const getCartCount = useCallback(() => {
//     return cart.reduce((count, item) => count + item.quantity, 0);
//   }, [cart]);

//   const isAuthenticated = !!user;
//   const isVendor = user?.role === 'Vendor';
//   const isAdmin = user?.role === 'Admin';

//   const value = {
//     user,
//     loading,
//     cart,
//     cartOpen,
//     login,
//     register,
//     logout,
//     updateProfile,
//     openCart,
//     closeCart,
//     toggleCart,
//     addToCart,
//     removeFromCart,
//     updateCartQty,
//     clearCart,
//     getCartTotal,
//     getCartCount,
//     isAuthenticated,
//     isVendor,
//     isAdmin,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthContext;
