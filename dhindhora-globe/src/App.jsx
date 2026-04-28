import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const VisitorGlobe = lazy(() => import('./components/globe/VisitorGlobe'));

function GlobePage() {
  return (
    <main className="min-h-screen bg-[#05070D] text-white relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#6366F1] rounded-full mix-blend-screen opacity-10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#22D3EE] rounded-full mix-blend-screen opacity-10 blur-[120px] pointer-events-none"></div>

      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1.5 rounded-full border border-[#6366F1]/30 bg-[#6366F1]/10 mb-4">
            <span className="text-[#6366F1] text-sm font-bold tracking-widest uppercase">Deep Space Network</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] via-[#F472B6] to-[#22D3EE] mb-4 drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            GALACTIC NODE
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto font-medium">
            Watch visitors arrive from across the cosmos in real-time. Every glowing beacon represents a real connection across the globe.
          </p>
        </div>
        <Suspense fallback={
          <div className="glass-heavy rounded-2xl p-12 text-center text-white/50 border border-[#6366F1]/20 shadow-[0_0_50px_rgba(99,102,241,0.1)] flex flex-col items-center justify-center gap-4 min-h-[50vh] lg:min-h-[600px]">
            <div className="w-16 h-16 rounded-full border-4 border-[#6366F1] border-t-transparent animate-spin" />
            <p className="tracking-widest uppercase text-sm font-bold">Establishing Uplink...</p>
          </div>
        }>
          <VisitorGlobe webreelId="global" />
        </Suspense>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<GlobePage />} />
    </Routes>
  );
}
