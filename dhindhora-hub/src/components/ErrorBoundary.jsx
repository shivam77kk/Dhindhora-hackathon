import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (!import.meta.env.PROD) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '60vh', textAlign: 'center', padding: '2rem',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌌</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 400, marginBottom: '1.5rem' }}>
            A rift opened in the multiverse. Try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'var(--primary)', color: '#fff', border: 'none',
              padding: '0.75rem 2rem', borderRadius: '12px', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.9rem',
            }}
          >
            Reload Portal
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
