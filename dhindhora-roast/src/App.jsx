import { useState } from 'react';
import { motion } from 'framer-motion';
import RoastEngine from './components/RoastEngine';
import RoastLeaderboard from './components/RoastLeaderboard';

function App() {
  const [tab, setTab] = useState('roast');

  return (
    <div className="scanline-overlay" style={{ minHeight: '100vh' }}>
      {/* TAPE STRIP TOP */}
      <div className="tape-strip" />

      {/* BACK LINK */}
      <a href={import.meta.env.VITE_HUB_URL || '/'} className="back-link">← MULTIVERSE</a>

      {/* HEADER */}
      <header style={{ textAlign: 'center', padding: '4rem 1rem 2rem' }}>
        <motion.h1
          initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: 'clamp(3rem, 10vw, 6rem)', lineHeight: 0.95, marginBottom: '0.75rem' }}
        >
          <span className="zine-text fire-glow">AI ROAST</span>
          <br />
          <span style={{ color: 'var(--white)', fontSize: '0.7em' }}>ENGINE</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ color: 'var(--gray-400)', fontSize: '0.95rem', maxWidth: 450, margin: '0 auto' }}>
          Enter your name. Get destroyed by AI. Share the carnage.
        </motion.p>
      </header>

      {/* TAB SELECTOR */}
      <div style={{ maxWidth: 680, margin: '0 auto 1.5rem', padding: '0 1rem', display: 'flex', gap: 0 }}>
        {[{ id: 'roast', label: '🔥 ROAST ME' }, { id: 'leaderboard', label: '🏆 LEADERBOARD' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '0.75rem', border: '2px solid var(--gray-600)',
              background: tab === t.id ? 'var(--gray-800)' : 'transparent',
              color: tab === t.id ? 'var(--primary)' : 'var(--gray-400)',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem',
              letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.2s',
              borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid var(--gray-600)',
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* CONTENT */}
      {tab === 'roast' ? <RoastEngine /> : (
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 1rem 4rem' }}>
          <RoastLeaderboard />
        </div>
      )}

      {/* TAPE STRIP BOTTOM */}
      <div style={{ marginTop: '4rem' }} className="tape-strip" />

      {/* FOOTER */}
      <footer style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--gray-600)', fontSize: '0.75rem' }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.1em' }}>
          DHINDHORA × BLACK CLOVERS
        </span>
      </footer>
    </div>
  );
}

export default App;
