import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public & Auth Pages
import { LandingPage } from './pages/LandingPage';
import { RoleSelectionPage } from './pages/RoleSelectionPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';
import { SupportPage } from './pages/SupportPage';
import { SettingsPage } from './pages/SettingsPage';

// Creator Studio Pages
import { CreatorDashboardPage } from './pages/creator/DashboardPage';
import { GeneratorPage } from './pages/creator/GeneratorPage';
import { EditorPage } from './pages/creator/EditorPage';
import { TemplatesPage } from './pages/creator/TemplatesPage';
import { AssetsPage } from './pages/creator/AssetsPage';

// Business Workspace Pages
import { BusinessDashboardPage } from './pages/business/DashboardPage';
import { CampaignsPage } from './pages/business/CampaignsPage';
import { CreateCampaignPage } from './pages/business/CreateCampaignPage';
import { ApprovalsPage } from './pages/business/ApprovalsPage';
import { BrandKitPage } from './pages/business/BrandKitPage';
import { AnalyticsPage } from './pages/business/AnalyticsPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/role-selection" element={<RoleSelectionPage />} />
        <Route path="/roles" element={<Navigate to="/role-selection" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/:role" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Creator Studio Routes */}
        <Route path="/creator" element={<Navigate to="/creator/dashboard" replace />} />
        <Route
          path="/creator/dashboard"
          element={
            <ProtectedRoute>
              <CreatorDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creator/generator"
          element={
            <ProtectedRoute>
              <GeneratorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creator/editor"
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creator/templates"
          element={
            <ProtectedRoute>
              <TemplatesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creator/assets"
          element={
            <ProtectedRoute>
              <AssetsPage />
            </ProtectedRoute>
          }
        />

        {/* Business Workspace Routes (Paid Plan Gated) */}
        <Route path="/business" element={<Navigate to="/business/dashboard" replace />} />
        <Route
          path="/business/dashboard"
          element={
            <ProtectedRoute requirePaid={true}>
              <BusinessDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/campaigns"
          element={
            <ProtectedRoute requirePaid={true}>
              <CampaignsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/campaigns/create"
          element={
            <ProtectedRoute requirePaid={true}>
              <CreateCampaignPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/approvals"
          element={
            <ProtectedRoute requirePaid={true}>
              <ApprovalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/brand-kit"
          element={
            <ProtectedRoute requirePaid={true}>
              <BrandKitPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/analytics"
          element={
            <ProtectedRoute requirePaid={true}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
