'use client';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';

const AirDrawingCanvas = dynamic(() => import('@/components/air-canvas/AirDrawingCanvas'), { ssr: false });

export default function AirCanvasPage() {
  return (
    <main className="min-h-screen bg-[#050510] relative overflow-hidden">
      {}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-pink/10 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-20">
        <header className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 rounded-full glass border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-widest mb-4"
          >
            MediaPipe Hand Tracking • AI Vision
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-black text-white mb-6"
          >
            Air <span className="gradient-text">Canvas</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Draw in thin air using your hands. Our AI recognizes your gestures and collaborates with you in real-time.
          </motion.p>
        </header>

        <section className="relative">
          <AirDrawingCanvas roomId="creative-hub-01" />
        </section>

        <footer className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Zero Hardware', desc: 'No special sensors needed. Just your normal laptop webcam.', icon: '💻' },
            { title: 'Real-time Sync', desc: 'Collaborate with friends instantly via socket-speed strokes.', icon: '⚡' },
            { title: 'AI Recognition', desc: 'Our Gemini layer interprets your drawing into interactive components.', icon: '🧠' },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="glass rounded-2xl p-6 border border-white/5"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </footer>
      </div>
    </main>
  );
}
