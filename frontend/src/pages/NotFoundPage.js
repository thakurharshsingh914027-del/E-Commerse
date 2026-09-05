import React from 'react';
import { Link } from 'react-router-dom';
import { HiExclamationCircle, HiHome } from 'react-icons/hi';

const NotFoundPage = () => {
  return (
    <div className="auth-page">
      <div className="fade-in" style={{ textAlign: 'center', maxWidth: '480px', padding: '0 24px' }}>
        <HiExclamationCircle
          style={{
            fontSize: '80px',
            color: 'var(--primary, #FF6B35)',
            marginBottom: '20px',
            opacity: 0.85,
          }}
        />

        <h1
          style={{
            fontSize: '96px',
            fontWeight: '900',
            lineHeight: 1,
            marginBottom: '8px',
            background: 'linear-gradient(135deg, var(--primary, #FF6B35), #E74C3C)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </h1>

        <h2
          style={{
            fontSize: '24px',
            fontWeight: '700',
            color: 'var(--gray-800, #212529)',
            marginBottom: '12px',
          }}
        >
          Page Not Found
        </h2>

        <p
          style={{
            fontSize: '16px',
            color: 'var(--gray-500, #636E72)',
            lineHeight: 1.6,
            marginBottom: '32px',
            maxWidth: '360px',
            margin: '0 auto 32px',
          }}
        >
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>

        <Link
          to="/"
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 32px',
            fontSize: '15px',
            fontWeight: '600',
            textDecoration: 'none',
          }}
        >
          <HiHome />
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
