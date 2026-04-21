import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';

export const metadata = { title: 'Gesture Game — Dhindhora', description: 'Play with your hand gestures via webcam' };

const GestureGame = dynamic(() => import('@/components/game/GestureGame'), {
  ssr: false,
  loading: () => <div className="glass rounded-2xl p-12 text-center text-white/40 animate-pulse" style={{ minHeight: 400 }}>Loading Game Engine...</div>,
});

export default function GestureGamePage() {
  return (
    <main className="min-h-screen bg-[#050510]">
      <Navbar />
      <div className="pt-24 pb-12 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-display font-black gradient-text mb-3">🎮 Gesture Game</h1>
          <p className="text-white/50 text-base max-w-xl mx-auto">
            Control a rocket using only your hand gestures. Dodge obstacles, collect stars, climb the live leaderboard.
          </p>
        </div>
        <GestureGame />
      </div>
    </main>
  );
}
