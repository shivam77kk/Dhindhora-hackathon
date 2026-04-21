import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';

export const metadata = { title: 'Live Globe — Dhindhora', description: 'Real-time 3D visitor world map' };

const VisitorGlobe = dynamic(() => import('@/components/globe/VisitorGlobe'), {
  ssr: false,
  loading: () => <div className="glass rounded-2xl p-12 text-center text-white/40 animate-pulse" style={{ minHeight: 500 }}>Loading Globe...</div>,
});

export default function GlobePage() {
  return (
    <main className="min-h-screen bg-[#050510]">
      <Navbar />
      <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-display font-black gradient-text mb-3">🌐 Live Visitor Globe</h1>
          <p className="text-white/50 text-base max-w-xl mx-auto">
            Watch visitors arrive from around the world in real time. Every glowing dot is a real person.
          </p>
        </div>
        <VisitorGlobe webreelId="global" />
      </div>
    </main>
  );
}
