import React from 'react';
import { Link } from 'react-router-dom';
import { HiShoppingBag, HiPhone, HiMail, HiLocationMarker } from 'react-icons/hi';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <h3><HiShoppingBag /> <span>ShopMart</span></h3>
            <p>
              India's smartest AI-enabled multi-vendor e-commerce platform.
              Discover amazing products from trusted vendors across the country.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook">f</a>
              <a href="#" aria-label="Twitter">𝕏</a>
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="LinkedIn">in</a>
            </div>
          </div>

          {/* Company */}
          <div className="footer-col">
            <h4>Company</h4>
            <div className="footer-links">
              <Link to="/">About Us</Link>
              <Link to="/">Contact</Link>
              <Link to="/">Careers</Link>
              <Link to="/">Blog</Link>
              <Link to="/">Press</Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="footer-col">
            <h4>Customer Service</h4>
            <div className="footer-links">
              <Link to="/">FAQ</Link>
              <Link to="/">Returns & Refunds</Link>
              <Link to="/">Shipping Info</Link>
              <Link to="/">Track Order</Link>
              <Link to="/">Report Issue</Link>
            </div>
            <div style={{ marginTop: '20px' }}>
              <div className="footer-links">
                <a href="mailto:support@shopmart.in" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HiMail /> support@shopmart.in
                </a>
                <a href="tel:+911234567890" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HiPhone /> +91 123 456 7890
                </a>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ADB5BD', fontSize: '14px' }}>
                  <HiLocationMarker /> Mumbai, India
                </span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h4>Categories</h4>
            <div className="footer-links">
              <Link to="/search?category=Electronics">Electronics</Link>
              <Link to="/search?category=Clothing">Clothing</Link>
              <Link to="/search?category=Books">Books</Link>
              <Link to="/search?category=Sports">Sports</Link>
              <Link to="/search?category=Beauty">Beauty</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ShopMart. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/">Privacy Policy</Link>
            <Link to="/">Terms of Service</Link>
            <Link to="/">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
