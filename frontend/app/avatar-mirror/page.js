'use client';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';

const AvatarMirror = dynamic(() => import('@/components/avatar/AvatarMirror'), { ssr: false });

export default function AvatarMirrorPage() {
  return (
    <main className="min-h-screen bg-[#050510] relative overflow-hidden">
      {/* Background stardust */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-brand-500/5 rounded-full blur-[150px]" />
      </div>

      <Navbar />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20">
        <header className="mb-14 text-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-7xl font-display font-black text-white"
          >
            Avatar <span className="gradient-text">Mirror</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/40 text-lg mt-4 max-w-2xl mx-auto"
          >
            A futuristic 3D companion that feels what you feel. Face-api.js powers the detection, Three.js powers the presence.
          </motion.p>
        </header>

        <section className="glass rounded-3xl p-6 md:p-10 border border-white/10 shadow-2xl">
          <AvatarMirror />
        </section>

        <section className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="glass rounded-2xl p-8 border border-white/5 space-y-4">
            <h3 className="text-2xl font-bold text-white">How it works</h3>
            <div className="space-y-4">
              {[
                { title: 'Neural Detection', text: 'TinyFaceDetector analyzes 68 facial landmarks locally in your browser.' },
                { title: 'Emotion Mapping', text: 'Real-time expression confidence levels map to avatar vertex shaders.' },
                { title: 'Dynamic Coloring', text: 'The avatar glow and environment shifts colors to match your mood.' },
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-bold border border-brand-500/40">{i+1}</span>
                  <div>
                    <h4 className="text-white font-semibold text-sm">{step.title}</h4>
                    <p className="text-white/40 text-xs mt-1 leading-relaxed">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative h-64 glass rounded-2xl border border-white/5 flex flex-col items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent" />
            <div className="text-6xl mb-4 animate-bounce">🧬</div>
            <p className="text-white font-bold text-lg">Mirror Neutral v2.0</p>
            <p className="text-white/30 text-xs">Ready for neural synchronization</p>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
