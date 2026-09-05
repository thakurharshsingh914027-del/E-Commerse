import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          containerStyle={{ zIndex: 99999 }}
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '8px',
              
              background: '#2D3436',
              color: '#fff',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#00B894', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#E17055', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
