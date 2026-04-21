import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';

export const metadata = { title: 'Fortune Oracle — Dhindhora', description: 'AI cosmic personality reading' };

const FortuneOracle = dynamic(() => import('@/components/oracle/FortuneOracle'), {
  ssr: false,
  loading: () => <div className="glass rounded-2xl p-12 text-center text-white/40 animate-pulse" style={{ minHeight: 400 }}>Awakening the Oracle...</div>,
});

export default function OraclePage() {
  return (
    <main className="min-h-screen bg-[#050510]" style={{ background: 'radial-gradient(ellipse at top, #1a0530 0%, #050510 60%)' }}>
      <Navbar />
      <div className="pt-24 pb-12 px-4 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-display font-black gradient-text mb-3">🔮 Fortune Oracle</h1>
          <p className="text-white/50 text-base max-w-xl mx-auto">
            Answer 3 mystical questions. The AI cosmos reveals your spirit animal, hidden power, destiny quote, and cosmic fate.
          </p>
        </div>
        <FortuneOracle />
      </div>
    </main>
  );
}
