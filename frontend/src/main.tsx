import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#FFFFFF',
            color: '#2D1B69',
            border: '1px solid #E9D5FF',
            borderRadius: '16px',
            boxShadow: '0 8px 24px -4px rgba(139,92,246,.12)',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#8B5CF6',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
