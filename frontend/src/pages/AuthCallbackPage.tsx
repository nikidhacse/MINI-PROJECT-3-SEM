import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AuthCallbackPage: React.FC = () => {
  const { status, capabilities } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'ready') {
      navigate(capabilities.isSolo ? '/creator/dashboard' : '/business/dashboard', { replace: true });
    } else if (status === 'needs_onboarding') {
      navigate('/onboarding', { replace: true });
    } else if (status === 'signed_out') {
      navigate('/role-selection', { replace: true });
    }
  }, [status, capabilities, navigate]);

  return (
    <div className="min-h-screen bg-aether-bg flex flex-col items-center justify-center p-6">
      <div className="w-12 h-12 rounded-full border-4 border-aether-border border-t-aether-primary animate-spin mb-4" />
      <p className="text-aether-text font-semibold text-sm">Completing Authentication...</p>
    </div>
  );
};
