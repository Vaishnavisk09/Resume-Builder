import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ResumeProvider } from './context/ResumeContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ResumeBuilderPage from './pages/builder/ResumeBuilderPage';
import MyResumesPage from './pages/resumes/MyResumesPage';
import ATSAnalyzerPage from './pages/analyzer/ATSAnalyzerPage';
import JobMatcherPage from './pages/matcher/JobMatcherPage';
import ProfilePage from './pages/profile/ProfilePage';
import TemplatesPage from './pages/templates/TemplatesPage';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-secondary-text text-sm font-medium">Loading ResumeIQ...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Public route wrapper (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout>
            <DashboardPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/resumes" element={
        <ProtectedRoute>
          <DashboardLayout>
            <MyResumesPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/builder" element={
        <ProtectedRoute>
          <ResumeProvider>
            <ResumeBuilderPage />
          </ResumeProvider>
        </ProtectedRoute>
      } />
      <Route path="/builder/:id" element={
        <ProtectedRoute>
          <ResumeProvider>
            <ResumeBuilderPage />
          </ResumeProvider>
        </ProtectedRoute>
      } />
      <Route path="/analyzer" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ATSAnalyzerPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/analyzer/:id" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ATSAnalyzerPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/job-matcher" element={
        <ProtectedRoute>
          <DashboardLayout>
            <JobMatcherPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/templates" element={
        <ProtectedRoute>
          <DashboardLayout>
            <TemplatesPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ProfilePage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#24233A',
              border: '1px solid #EBE9F2',
              borderRadius: '12px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            },
            success: {
              iconTheme: { primary: '#7155E8', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}
