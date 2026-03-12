import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Bir hata oluştu</h2>
          <p>{this.state.error?.message || 'Uygulama yüklenirken bir sorun oluştu'}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>Sainat AI</h1>
      <p>Uygulama başarıyla yüklendi!</p>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
