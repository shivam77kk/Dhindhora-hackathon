import React, { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import VintageBackground from './components/three/VintageBackground';
import './App.css';

const FortuneOracle = React.lazy(() => import('./components/oracle/FortuneOracle'));

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#221e19',
            color: '#e0d4be',
            border: '1px solid rgba(196,163,90,0.25)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Lora, Georgia, serif',
          },
        }}
      />

      {/* Three.js golden dust background */}
      <VintageBackground />

      {/* Vignette + film grain overlays */}
      <div className="vignette" />
      <div className="film-grain" />

      <main
        className="min-h-screen relative"
        style={{
          background: 'radial-gradient(ellipse at 50% 20%, #1c1814 0%, #12100e 60%, #0a0908 100%)',
        }}
      >
        <div className="relative z-10 pt-12 sm:pt-20 pb-12 px-4 max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="ornament mb-5">
              <span className="text-vintage-text-dim tracking-[0.2em] uppercase text-[11px] font-body">
                The Cosmos Speaks
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold gradient-text mb-3 leading-tight">
              Fortune Oracle
            </h1>

            <p className="text-vintage-text-dim text-sm sm:text-base max-w-md mx-auto leading-relaxed font-body italic">
              Answer three mystical questions and let the ancient cosmos reveal
              your spirit animal, hidden power, and cosmic destiny.
            </p>

            <div className="ornament mt-5">
              <span className="text-vintage-gold/40 text-lg">✦</span>
            </div>
          </div>

          {/* Oracle Component */}
          <Suspense
            fallback={
              <div className="vintage-card p-10 sm:p-12 text-center animate-pulse">
                <div className="text-4xl mb-4">🔮</div>
                <p className="text-vintage-text-dim text-sm font-body italic">
                  Awakening the Oracle…
                </p>
              </div>
            }
          >
            <FortuneOracle />
          </Suspense>

          {/* Footer ornament */}
          <div className="text-center mt-10 sm:mt-14">
            <div className="ornament">
              <span className="text-vintage-gold/30 text-xs tracking-[0.3em] uppercase font-mono">
                Dhindhora Oracle
              </span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
