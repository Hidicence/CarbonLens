import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import SimpleLoginPage from './components/SimpleLoginPage';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Emissions from './pages/Emissions';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import ShootingDays from './pages/ShootingDays';
import './index.css';

// APP端相同的色系定義
const colors = {
  primary: '#10B981',
  secondary: '#059669',
  background: '#0F172A',
  card: '#1E293B',
  text: '#F9FAFB',
  secondaryText: '#9CA3AF',
  border: '#334155',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  highlight: '#064E3B',
};

function AppContent() {
  const { user, loading } = useAuth();

  const loadingStyles = {
    container: {
      minHeight: '100vh',
      backgroundColor: colors.background,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    },
    content: {
      textAlign: 'center' as const,
    },
    spinner: {
      width: '48px',
      height: '48px',
      border: `3px solid ${colors.border}`,
      borderTop: `3px solid ${colors.primary}`,
      borderRadius: '50%',
      margin: '0 auto 16px',
      animation: 'spin 1s linear infinite',
    },
    text: {
      color: colors.secondaryText,
      fontSize: '16px',
    },
  };

  const appStyles = {
    container: {
      minHeight: '100vh',
      backgroundColor: colors.background,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    },
  };

  if (loading) {
    return (
      <div style={loadingStyles.container}>
        <div style={loadingStyles.content}>
          <div style={loadingStyles.spinner}></div>
          <p style={loadingStyles.text}>載入中...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <SimpleLoginPage />;
  }

  return (
    <div style={appStyles.container}>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/emissions" element={<Emissions />} />
          <Route path="/shooting-days" element={<ShootingDays />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: colors.card,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: colors.success,
              secondary: colors.text,
            },
          },
          error: {
            iconTheme: {
              primary: colors.error,
              secondary: colors.text,
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App; 