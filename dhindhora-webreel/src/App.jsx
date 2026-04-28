import React, { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import './index.css';
import WebReelBackground from './components/three/WebReelBackground';

const WebReelPage = React.lazy(() => import('./components/webreel/WebReelPage'));

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            color: '#111827',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            borderRadius: '16px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          },
        }}
      />

      <WebReelBackground />

      <main className="relative z-10 min-h-screen">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-4 animate-bounce">✨</div>
              <p className="text-gray-500 font-display text-lg">Loading Studio...</p>
            </div>
          </div>
        }>
          <WebReelPage />
        </Suspense>
      </main>
    </>
  );
}
