import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HiEye,
  HiEyeOff,
  HiLockClosed,
  HiMail,
  HiOfficeBuilding,
  HiPhone,
  HiShieldCheck,
  HiSparkles,
  HiUser,
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated } = useAuth();

  const [mode, setMode] = useState('login');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Customer',
    storeName: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    setMode(location.pathname === '/register' ? 'register' : 'login');
  }, [location.pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const title = useMemo(
    () =>
      mode === 'login'
        ? 'Welcome back to ShopMart'
        : 'Create your ShopMart account',
    [mode]
  );

  const subtitle = useMemo(
    () =>
      mode === 'login'
        ? 'Sign in to manage orders, save favourites, and continue where you left off.'
        : 'Join the marketplace to shop, sell, or manage the platform from one account flow.',
    [mode]
  );

  const validateLogin = () => {
    const nextErrors = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!loginData.password) {
      nextErrors.password = 'Password is required';
    }

    return nextErrors;
  };

  const validateRegister = () => {
    const nextErrors = {};

    if (registerData.name.trim().length < 2) {
      nextErrors.name = 'Name must be at least 2 characters';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!/^\d{10}$/.test(registerData.phone.trim())) {
      nextErrors.phone = 'Enter a valid 10-digit phone number';
    }

    if (registerData.role === 'Vendor' && !registerData.storeName.trim()) {
      nextErrors.storeName = 'Store name is required for vendors';
    }

    if (registerData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    if (registerData.confirmPassword !== registerData.password) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    return nextErrors;
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLogin();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await login(loginData.email.trim().toLowerCase(), loginData.password);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        email: error.response?.status === 401 ? 'Invalid email or password' : prev.email,
        password: error.response?.status === 401 ? 'Invalid email or password' : prev.password,
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegister();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await register({
        username: registerData.name.trim(),
        email: registerData.email.trim().toLowerCase(),
        password: registerData.password,
        phone: registerData.phone.trim(),
        role: registerData.role,
        storeName: registerData.storeName.trim(),
      });
    } catch (error) {
      const message = error.response?.data?.message;
      if (message) {
        setErrors((prev) => ({
          ...prev,
          email: message.toLowerCase().includes('email') || message.toLowerCase().includes('exists') ? message : prev.email,
        }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (nextMode) => {
    setErrors({});
    navigate(nextMode === 'login' ? '/login' : '/register');
  };

  const inputClass = (field) => `auth-input ${errors[field] ? 'error' : ''}`;

  return (
    <div className="auth-page auth-page-enhanced">
      <div className="auth-shell">
        <div className="auth-showcase">
          <Link to="/" className="auth-brand">
            ShopMart
          </Link>
          <h1>{title}</h1>
          <p>{subtitle}</p>

          <div className="auth-showcase-list">
            <div className="auth-showcase-item">
              <HiSparkles />
              <span>AI-assisted shopping and faster product discovery</span>
            </div>
            <div className="auth-showcase-item">
              <HiShieldCheck />
              <span>Protected checkout, saved cart, and secure account access</span>
            </div>
            <div className="auth-showcase-item">
              <HiOfficeBuilding />
              <span>Customer and vendor access from the same clean sign-in flow</span>
            </div>
          </div>
        </div>

        <div className="auth-panel">
          <div className="auth-card auth-card-enhanced">
            <div className="auth-header">
              <h2>{mode === 'login' ? 'Sign In' : 'Register'}</h2>
              <p>{mode === 'login' ? 'Access your account' : 'Set up your account in a minute'}</p>
            </div>

            <div className="auth-tabs auth-tabs-enhanced">
              <button
                type="button"
                className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                onClick={() => switchMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
                onClick={() => switchMode('register')}
              >
                Register
              </button>
            </div>

            {mode === 'login' ? (
              <form className="auth-form auth-form-enhanced" onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="auth-input-wrap">
                    <HiMail />
                    <input
                      className={inputClass('email')}
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={loginData.email}
                      onChange={handleLoginChange}
                    />
                  </div>
                  {errors.email ? <span className="form-error">{errors.email}</span> : null}
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="auth-input-wrap">
                    <HiLockClosed />
                    <input
                      className={inputClass('password')}
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                    />
                    <button
                      type="button"
                      className="auth-input-toggle"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <HiEyeOff /> : <HiEye />}
                    </button>
                  </div>
                  {errors.password ? <span className="form-error">{errors.password}</span> : null}
                </div>

                <button type="submit" className="btn btn-primary btn-block auth-submit-btn" disabled={submitting}>
                  {submitting ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form className="auth-form auth-form-enhanced" onSubmit={handleRegisterSubmit}>
                <div className="auth-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <div className="auth-input-wrap">
                      <HiUser />
                      <input
                        className={inputClass('name')}
                        type="text"
                        name="name"
                        placeholder="Your full name"
                        value={registerData.name}
                        onChange={handleRegisterChange}
                      />
                    </div>
                    {errors.name ? <span className="form-error">{errors.name}</span> : null}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <div className="auth-input-wrap">
                      <HiPhone />
                      <input
                        className={inputClass('phone')}
                        type="text"
                        name="phone"
                        placeholder="10-digit number"
                        value={registerData.phone}
                        onChange={handleRegisterChange}
                      />
                    </div>
                    {errors.phone ? <span className="form-error">{errors.phone}</span> : null}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="auth-input-wrap">
                    <HiMail />
                    <input
                      className={inputClass('email')}
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                    />
                  </div>
                  {errors.email ? <span className="form-error">{errors.email}</span> : null}
                </div>

                <div className="form-group">
                  <label className="form-label">Account Type</label>
                  <div className="auth-role-toggle">
                    {['Customer', 'Vendor', 'Admin'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        className={`auth-role-chip ${registerData.role === role ? 'active' : ''}`}
                        onClick={() => setRegisterData((prev) => ({ ...prev, role }))}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {registerData.role === 'Vendor' ? (
                  <div className="form-group">
                    <label className="form-label">Store Name</label>
                    <div className="auth-input-wrap">
                      <HiOfficeBuilding />
                      <input
                        className={inputClass('storeName')}
                        type="text"
                        name="storeName"
                        placeholder="Your store name"
                        value={registerData.storeName}
                        onChange={handleRegisterChange}
                      />
                    </div>
                    {errors.storeName ? <span className="form-error">{errors.storeName}</span> : null}
                  </div>
                ) : null}

                <div className="auth-grid">
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="auth-input-wrap">
                      <HiLockClosed />
                      <input
                        className={inputClass('password')}
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Minimum 6 characters"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                      />
                      <button
                        type="button"
                        className="auth-input-toggle"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? <HiEyeOff /> : <HiEye />}
                      </button>
                    </div>
                    {errors.password ? <span className="form-error">{errors.password}</span> : null}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <div className="auth-input-wrap">
                      <HiLockClosed />
                      <input
                        className={inputClass('confirmPassword')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Repeat your password"
                        value={registerData.confirmPassword}
                        onChange={handleRegisterChange}
                      />
                      <button
                        type="button"
                        className="auth-input-toggle"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                      >
                        {showConfirmPassword ? <HiEyeOff /> : <HiEye />}
                      </button>
                    </div>
                    {errors.confirmPassword ? <span className="form-error">{errors.confirmPassword}</span> : null}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block auth-submit-btn" disabled={submitting}>
                  {submitting ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            )}

            <div className="auth-footer">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button type="button" className="auth-text-btn" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>
                {mode === 'login' ? 'Register here' : 'Login here'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
