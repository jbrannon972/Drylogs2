import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useOfflineSync } from './hooks/useOfflineSync';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { LoginPage } from './components/auth/LoginPage';
import { Layout } from './components/layout/Layout';
import { TechDashboard } from './components/tech/TechDashboard';
import { LeadDashboard } from './components/lead/LeadDashboard';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { InstallWorkflow } from './components/tech/workflows/InstallWorkflow';

// Debug version identifier
console.log('🚀 MIT Dry Logs v1.0.1 - Build:', new Date().toISOString());
console.log('📦 Environment check:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
});

function App() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const {} = useOfflineSync(); // Initialize offline sync

  // Debug logging
  useEffect(() => {
    console.log('🔄 App render - Loading:', isLoading, 'Authenticated:', isAuthenticated);
  }, [isLoading, isAuthenticated]);

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Initializing MIT Dry Logs..." />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === 'MIT_TECH' ? '/tech' : '/lead'} replace />
            ) : (
              <LoginPage />
            )
          }
        />

        {/* MIT Tech Routes */}
        <Route
          path="/tech"
          element={
            <ProtectedRoute allowedRoles={['MIT_TECH']}>
              <Layout>
                <TechDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tech/job/:jobId/install"
          element={
            <ProtectedRoute allowedRoles={['MIT_TECH']}>
              <InstallWorkflow />
            </ProtectedRoute>
          }
        />

        {/* MIT Lead Routes */}
        <Route
          path="/lead"
          element={
            <ProtectedRoute allowedRoles={['MIT_LEAD', 'ADMIN']}>
              <Layout>
                <LeadDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Root redirect */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === 'MIT_TECH' ? '/tech' : '/lead'} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 404 - Redirect to appropriate dashboard */}
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? (user?.role === 'MIT_TECH' ? '/tech' : '/lead') : '/login'} replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
