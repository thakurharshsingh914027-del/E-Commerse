import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiShoppingBag,
  HiSearch,
  HiUser,
  HiMenu,
  HiX,
  HiLogout,
  HiMoon,
  HiClipboardList,
  HiCube,
  HiHeart,
  HiSun,
  HiUsers,
  HiChartBar,
  HiTrendingUp,
} from 'react-icons/hi';

const Navbar = ({ darkMode, onToggleDarkMode }) => {
  const { user, isAuthenticated, isAdmin, isVendor, logout, getCartCount, openCart } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState('');
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const cartCount = getCartCount();
  const displayName =
    user?.username ||
    user?.name ||
    user?.fullName ||
    (user?.email ? user.email.split('@')[0] : 'User');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setSearchQuery('');
    }
  };

  const handleMobileSearch = (e) => {
    e.preventDefault();
    const query = mobileSearch.trim();
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setMobileSearch('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // FIX: Redirects customers to /profile instead of home '/'
  const getProfileLink = () => {
    if (isAdmin) return '/admin/profile'; // Or just '/profile' depending on your routes
    if (isVendor) return '/vendor/profile'; 
    return '/profile'; 
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    if (isVendor) return '/vendor/dashboard';
    return '/orders'; // Default dashboard for customers is their orders
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
            <HiShoppingBag />
            <span>ShopMart</span>
          </Link>

          {/* Desktop Search */}
          <form className="nav-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">
              <HiSearch />
            </button>
          </form>

          <div className="nav-links">
            <button
              className="nav-icon-btn"
              onClick={onToggleDarkMode}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              type="button"
            >
              {darkMode ? <HiSun /> : <HiMoon />}
            </button>

            {isAuthenticated && (
              <button
                className="nav-icon-btn"
                onClick={() => navigate('/wishlist')}
                title="Wishlist"
              >
                <HiHeart />
              </button>
            )}

            <button
              className="nav-icon-btn"
              onClick={openCart}
              title="Shopping Cart"
            >
              <HiShoppingBag />
              {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
            </button>

            {isAuthenticated ? (
              <div className="nav-user-dropdown" ref={dropdownRef}>
                <button
                  className="nav-icon-btn"
                  onClick={() => setShowDropdown(!showDropdown)}
                  title="Account"
                >
                  <HiUser />
                </button>
                
                <div className={`nav-user-menu ${showDropdown ? 'active' : ''}`}>
                  <div className="nav-user-menu-header">
                    <div className="nav-user-avatar">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="nav-user-info">
                      <h4>{displayName}</h4>
                      <p className="user-role-tag">{user?.role}</p>
                    </div>
                  </div>

                  <div className="nav-user-menu-divider" />

                  {/* Role-Specific Dashboard Links */}
                  {isAdmin && (
                    <>
                      <button className="nav-user-menu-item" onClick={() => { navigate('/admin'); setShowDropdown(false); }}>
                        <HiChartBar /> Admin Panel
                      </button>
                      <button className="nav-user-menu-item" onClick={() => { navigate('/admin/users'); setShowDropdown(false); }}>
                        <HiUsers /> Manage Users
                      </button>
                    </>
                  )}

                  {isVendor && (
                    <>
                      <button className="nav-user-menu-item" onClick={() => { navigate('/vendor/dashboard'); setShowDropdown(false); }}>
                        <HiTrendingUp /> Vendor Dashboard
                      </button>
                      <button className="nav-user-menu-item" onClick={() => { navigate('/vendor/add-product'); setShowDropdown(false); }}>
                        <HiCube /> Add Product
                      </button>
                    </>
                  )}

                  {/* Shared Links for Everyone */}
                  <button className="nav-user-menu-item" onClick={() => { navigate('/orders'); setShowDropdown(false); }}>
                    <HiClipboardList /> My Orders
                  </button>

                  <button className="nav-user-menu-item" onClick={() => { navigate('/wishlist'); setShowDropdown(false); }}>
                    <HiHeart /> Wishlist
                  </button>

                  {/* FIXED PROFILE BUTTON */}
                  <button className="nav-user-menu-item" onClick={() => { navigate(getProfileLink()); setShowDropdown(false); }}>
                    <HiUser /> Profile Settings
                  </button>

                  <div className="nav-user-menu-divider" />

                  <button className="nav-user-menu-item danger" onClick={handleLogout}>
                    <HiLogout /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="nav-auth-btns">
                <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </div>
            )}
          </div>

          <button
            className="nav-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <form className="mobile-search" onSubmit={handleMobileSearch}>
          <input
            type="text"
            placeholder="Search products..."
            value={mobileSearch}
            onChange={(e) => setMobileSearch(e.target.value)}
          />
        </form>
        <div className="mobile-menu-links">
          <Link to="/" onClick={closeMobileMenu}>Home</Link>
          <button type="button" onClick={onToggleDarkMode}>
            {darkMode ? <HiSun /> : <HiMoon />} {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          {isAuthenticated ? (
            <>
              <Link to={getDashboardLink()} onClick={closeMobileMenu}>Dashboard</Link>
              <Link to="/wishlist" onClick={closeMobileMenu}>Wishlist</Link>
              <Link to="/profile" onClick={closeMobileMenu}>Profile</Link>
              <button className="mobile-logout-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMobileMenu}>Login</Link>
              <Link to="/register" onClick={closeMobileMenu}>Register</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
// import React, { useState, useRef, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import {
//   HiShoppingBag,
//   HiSearch,
//   HiUser,
//   HiMenu,
//   HiX,
//   HiLogout,
//   HiClipboardList,
//   HiCube,
//   HiUsers,
//   HiChartBar,
//   HiTrendingUp,
// } from 'react-icons/hi';

// const Navbar = () => {
//   const { user, isAuthenticated, isAdmin, isVendor, logout, getCartCount, openCart } = useAuth();
//   const [searchQuery, setSearchQuery] = useState('');
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [mobileSearch, setMobileSearch] = useState('');
//   const navigate = useNavigate();
//   const dropdownRef = useRef(null);

//   const cartCount = getCartCount();

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setShowDropdown(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleSearch = (e) => {
//     e.preventDefault();
//     const query = searchQuery.trim();
//     if (query) {
//       navigate(`/search?q=${encodeURIComponent(query)}`);
//       setSearchQuery('');
//     }
//   };

//   const handleMobileSearch = (e) => {
//     e.preventDefault();
//     const query = mobileSearch.trim();
//     if (query) {
//       navigate(`/search?q=${encodeURIComponent(query)}`);
//       setMobileSearch('');
//       setMobileMenuOpen(false);
//     }
//   };

//   const handleLogout = () => {
//     logout();
//     setShowDropdown(false);
//     setMobileMenuOpen(false);
//   };

//   const closeMobileMenu = () => setMobileMenuOpen(false);

//   const getDashboardLink = () => {
//     if (isAdmin) return '/admin';
//     if (isVendor) return '/vendor/dashboard';
//     return '/';
//   };

//   return (
//     <>
//       <nav className="navbar">
//         <div className="navbar-container">
//           <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
//             <HiShoppingBag />
//             <span>ShopMart</span>
//           </Link>

//           <form className="nav-search" onSubmit={handleSearch}>
//             <input
//               type="text"
//               placeholder="Search products, brands, categories..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//             <button type="submit">
//               <HiSearch />
//             </button>
//           </form>

//           <div className="nav-links">
//             <button
//               className="nav-icon-btn"
//               onClick={openCart}
//               title="Shopping Cart"
//             >
//               <HiShoppingBag />
//               {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
//             </button>

//             {isAuthenticated ? (
//               <div className="nav-user-dropdown" ref={dropdownRef}>
//                 <button
//                   className="nav-icon-btn"
//                   onClick={() => setShowDropdown(!showDropdown)}
//                   title="Account"
//                 >
//                   <HiUser />
//                 </button>
//                 <div className={`nav-user-menu ${showDropdown ? 'active' : ''}`}>
//                   <div className="nav-user-menu-header">
//                     <div className="nav-user-avatar">
//                       {user?.name?.charAt(0)?.toUpperCase() || 'U'}
//                     </div>
//                     <div className="nav-user-info">
//                       <h4>{user?.name}</h4>
//                       <p>{user?.role}</p>
//                     </div>
//                   </div>

//                   {isAdmin && (
//                     <>
//                       <button className="nav-user-menu-item" onClick={() => { navigate('/admin'); setShowDropdown(false); }}>
//                         <HiChartBar /> Dashboard
//                       </button>
//                       <button className="nav-user-menu-item" onClick={() => { navigate('/admin/products'); setShowDropdown(false); }}>
//                         <HiCube /> Products
//                       </button>
//                       <button className="nav-user-menu-item" onClick={() => { navigate('/admin/orders'); setShowDropdown(false); }}>
//                         <HiClipboardList /> Orders
//                       </button>
//                       <button className="nav-user-menu-item" onClick={() => { navigate('/admin/users'); setShowDropdown(false); }}>
//                         <HiUsers /> Users
//                       </button>
//                       <div className="nav-user-menu-divider" />
//                     </>
//                   )}

//                   {isVendor && (
//                     <>
//                       <button className="nav-user-menu-item" onClick={() => { navigate('/vendor/dashboard'); setShowDropdown(false); }}>
//                         <HiTrendingUp /> Dashboard
//                       </button>
//                       <button className="nav-user-menu-item" onClick={() => { navigate('/vendor/products'); setShowDropdown(false); }}>
//                         <HiCube /> Products
//                       </button>
//                       <button className="nav-user-menu-item" onClick={() => { navigate('/vendor/orders'); setShowDropdown(false); }}>
//                         <HiClipboardList /> Orders
//                       </button>
//                       <button className="nav-user-menu-item" onClick={() => { navigate('/vendor/add-product'); setShowDropdown(false); }}>
//                         <HiCube /> Add Product
//                       </button>
//                       <div className="nav-user-menu-divider" />
//                     </>
//                   )}

//                   {!isAdmin && !isVendor && (
//                     <>
//                       <button className="nav-user-menu-item" onClick={() => { navigate('/orders'); setShowDropdown(false); }}>
//                         <HiClipboardList /> My Orders
//                       </button>
//                       <button className="nav-user-menu-item" onClick={() => { navigate(getDashboardLink()); setShowDropdown(false); }}>
//                         <HiUser /> Profile
//                       </button>
//                       <div className="nav-user-menu-divider" />
//                     </>
//                   )}

//                   <button className="nav-user-menu-item danger" onClick={handleLogout}>
//                     <HiLogout /> Logout
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="nav-auth-btns">
//                 <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
//                 <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
//               </div>
//             )}
//           </div>

//           <button
//             className="nav-hamburger"
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//           >
//             {mobileMenuOpen ? <HiX /> : <HiMenu />}
//           </button>
//         </div>
//       </nav>

//       {/* Mobile Menu */}
//       <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
//         <form className="mobile-search" onSubmit={handleMobileSearch}>
//           <input
//             type="text"
//             placeholder="Search products..."
//             value={mobileSearch}
//             onChange={(e) => setMobileSearch(e.target.value)}
//           />
//         </form>
//         <div className="mobile-menu-links">
//           <Link to="/" onClick={closeMobileMenu}>
//             <HiShoppingBag /> Home
//           </Link>

//           {isAuthenticated ? (
//             <>
//               {isAdmin && (
//                 <>
//                   <Link to="/admin" onClick={closeMobileMenu}>
//                     <HiChartBar /> Admin Dashboard
//                   </Link>
//                   <Link to="/admin/products" onClick={closeMobileMenu}>
//                     <HiCube /> Products
//                   </Link>
//                   <Link to="/admin/orders" onClick={closeMobileMenu}>
//                     <HiClipboardList /> Orders
//                   </Link>
//                   <Link to="/admin/users" onClick={closeMobileMenu}>
//                     <HiUsers /> Users
//                   </Link>
//                   <div className="mobile-menu-divider" />
//                 </>
//               )}

//               {isVendor && (
//                 <>
//                   <Link to="/vendor/dashboard" onClick={closeMobileMenu}>
//                     <HiTrendingUp /> Dashboard
//                   </Link>
//                   <Link to="/vendor/products" onClick={closeMobileMenu}>
//                     <HiCube /> My Products
//                   </Link>
//                   <Link to="/vendor/orders" onClick={closeMobileMenu}>
//                     <HiClipboardList /> My Orders
//                   </Link>
//                   <Link to="/vendor/add-product" onClick={closeMobileMenu}>
//                     <HiCube /> Add Product
//                   </Link>
//                   <div className="mobile-menu-divider" />
//                 </>
//               )}

//               {!isAdmin && !isVendor && (
//                 <>
//                   <Link to="/orders" onClick={closeMobileMenu}>
//                     <HiClipboardList /> My Orders
//                   </Link>
//                   <div className="mobile-menu-divider" />
//                 </>
//               )}

//               <button onClick={handleLogout}>
//                 <HiLogout /> Logout
//               </button>
//             </>
//           ) : (
//             <>
//               <Link to="/login" onClick={closeMobileMenu}>
//                 <HiUser /> Login
//               </Link>
//               <Link to="/register" onClick={closeMobileMenu}>
//                 <HiUser /> Register
//               </Link>
//             </>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default Navbar;
