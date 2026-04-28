import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import SpaceBackground from './components/ui/SpaceBackground';

const GestureGame = lazy(() => import('./components/game/GestureGame'));

function GestureGamePage() {
  return (
    <main className="min-h-screen relative text-white font-display">
      <SpaceBackground />
      <div className="relative z-10 pt-16 lg:pt-24 pb-12 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-5xl lg:text-7xl font-black gradient-text mb-4 tracking-tight drop-shadow-lg">ARCADE DODGE</h1>
          <p className="text-[#22d3ee] font-bold text-lg lg:text-xl max-w-2xl mx-auto font-arcade tracking-wider">
            INSERT COIN / RAISE HAND
          </p>
        </div>
        <Suspense fallback={<div className="arcade-panel rounded-2xl p-12 text-center text-[#22d3ee] animate-pulse font-arcade text-sm" style={{ minHeight: 400 }}>LOADING SYSTEM...</div>}>
          <GestureGame />
        </Suspense>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<GestureGamePage />} />
    </Routes>
  );
}
