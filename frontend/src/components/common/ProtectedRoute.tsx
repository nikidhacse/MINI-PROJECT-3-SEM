import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePaid?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requirePaid = false }) => {
  const { status, capabilities } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-aether-bg flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-full border-4 border-aether-border border-t-aether-primary animate-spin mb-4" />
        <p className="text-aether-text font-medium text-sm">Loading AetherDesign...</p>
      </div>
    );
  }

  if (status === 'signed_out') {
    return <Navigate to="/login/creator" state={{ from: location }} replace />;
  }

  if (status === 'needs_onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (requirePaid && capabilities.isSolo) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};
