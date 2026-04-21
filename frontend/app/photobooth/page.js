import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';

export const metadata = { title: 'AI Photobooth — Dhindhora', description: 'Take a selfie transformed into AI art' };

const PhotoBooth = dynamic(() => import('@/components/photobooth/PhotoBooth'), {
  ssr: false,
  loading: () => <div className="glass rounded-2xl p-12 text-center text-white/40 animate-pulse">Loading Photobooth...</div>,
});

export default function PhotoboothPage() {
  return (
    <main className="min-h-screen bg-[#050510]">
      <Navbar />
      <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-display font-black gradient-text mb-3">📸 AI Photobooth</h1>
          <p className="text-white/50 text-base max-w-xl mx-auto">
            Take a selfie. Choose an art style. AI transforms your photo into anime, cyberpunk, oil painting, and more.
          </p>
        </div>
        <PhotoBooth />
      </div>
    </main>
  );
}
