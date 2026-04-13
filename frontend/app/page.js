'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import CounterUp from '@/components/ui/CounterUp';
import TypewriterText from '@/components/ui/TypewriterText';
import GlowButton from '@/components/ui/GlowButton';
import CursorEffect from '@/components/ui/CursorEffect';
import ScrollProgress from '@/components/ui/ScrollProgress';
import WebGPUBadge from '@/components/ui/WebGPUBadge';
import MusicVisualizer from '@/components/ui/MusicVisualizer';
import { Zap, Star, Globe, Brain, Music, Eye, Trophy, DollarSign, Upload } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

const GalaxyScene = dynamic(() => import('@/components/three/GalaxyScene'), { ssr: false });

const WORDS = ['Story', 'Vision', 'Brand', 'World', 'Experience', 'Future'];

const FEATURES = [
  { icon: Brain, title: 'AI Emotion World', desc: 'Webcam detects your emotion. The 3D galaxy morphs, music shifts, colors transform in real-time.', color: 'from-brand-500 to-neon-purple', glow: '#6C63FF' },
  { icon: Zap, title: 'Live Reactions', desc: 'Socket.io emoji reactions shoot across the screen in 3D as other users interact simultaneously.', color: 'from-neon-pink to-neon-orange', glow: '#EC4899' },
  { icon: Globe, title: 'WebGPU Galaxy', desc: '200,000+ stars rendered with Three.js. Real-time parallax. Volumetric fog. Mesmerizing.', color: 'from-neon-cyan to-brand-400', glow: '#06B6D4' },
  { icon: DollarSign, title: 'Prediction Market', desc: 'Bet DhinCoins on real-world outcomes. Live odds. Real-time updates. Addictive loops.', color: 'from-neon-orange to-neon-pink', glow: '#F97316' },
  { icon: Music, title: 'AI Music Gen', desc: 'Each webreel gets a unique AI-composed soundtrack. Gemini + Tone.js synthesis.', color: 'from-neon-green to-neon-cyan', glow: '#10B981' },
  { icon: Upload, title: 'Multimodal Creation', desc: 'Upload a photo, voice note, or video. AI builds your entire webreel. Zero typing needed.', color: 'from-brand-400 to-neon-pink', glow: '#8028ff' },
  { icon: Star, title: '3D Gaussian Splats', desc: 'Upload photos and AI reconstructs a photorealistic 3D splat that floats in your hero section.', color: 'from-neon-cyan to-neon-green', glow: '#06B6D4' },
  { icon: Eye, title: 'Cinematic Transitions', desc: 'Camera flies through wormholes, portals, and black holes between every section.', color: 'from-neon-purple to-brand-500', glow: '#8B5CF6' },
  { icon: Trophy, title: 'Live Leaderboard', desc: 'Real-time competitive leaderboard with Socket.io. Watch your score climb live.', color: 'from-neon-pink to-neon-purple', glow: '#EC4899' },
];

export default function LandingPage() {
  const containerRef = useRef(null);
  const [wordIndex, setWordIndex] = useState(0);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.12], [1, 0.85]);

  useEffect(() => {
    const interval = setInterval(() => setWordIndex(i => (i + 1) % WORDS.length), 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050510] overflow-x-hidden">
      <CursorEffect />
      <ScrollProgress />
      <div className="fixed inset-0 z-0"><GalaxyScene /></div>

      <Navbar />

      <motion.section style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="portal-ring w-[600px] h-[600px] absolute opacity-20" />
          <div className="portal-ring-reverse w-[800px] h-[800px] absolute opacity-10" />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="mb-6 flex items-center gap-3">
          <span className="glass text-sm px-5 py-2 rounded-full text-brand-300 border border-brand-500/30">🏆 Team Black Clovers Presents</span>
          <WebGPUBadge />
        </motion.div>
        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold mb-6 leading-none">
          <motion.span initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>Your</motion.span>
          <br />
          <AnimatePresence mode="wait">
            <motion.span key={wordIndex} initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -80 }} transition={{ duration: 0.5 }} className="inline-block gradient-text">{WORDS[wordIndex]}</motion.span>
          </AnimatePresence>
          <br />
          <motion.span initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-white/90">Amplified.</motion.span>
        </h1>
        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="text-lg md:text-xl text-white/50 max-w-2xl mb-4 leading-relaxed">
          Create immersive AI-powered weboreels with <span className="text-brand-300">galaxy backgrounds</span>,
          <span className="text-neon-pink"> AI music</span>, <span className="text-neon-cyan">live prediction markets</span>, and cinematic portal transitions.
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="flex items-center gap-2 mb-10">
          <MusicVisualizer bars={8} /><span className="text-white/30 text-xs">AI music playing</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} className="flex flex-col sm:flex-row gap-4">
          <GlowButton href="/register" size="lg">Create Your Weboreel ✨</GlowButton>
          <Link href="/explore" className="px-8 py-4 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all text-lg backdrop-blur-sm">Explore Weboreels →</Link>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-10 flex flex-col items-center gap-2">
          <span className="text-white/30 text-xs tracking-widest uppercase">Scroll to enter the galaxy</span>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="w-6 h-10 border border-white/20 rounded-full flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-brand-400 rounded-full" />
          </motion.div>
        </motion.div>
      </motion.section>

      <section className="relative z-10 py-20 px-6 section-portal">
        <div className="flex justify-center mb-16">
          <div className="portal-ring w-24 h-24 flex items-center justify-center">
            <div className="portal-ring-reverse w-16 h-16 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-neon-pink animate-pulse" />
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Weboreels Created', value: 2847, icon: '🌌' },
            { label: 'Live Reactions', value: 45900, icon: '⚡' },
            { label: 'AI Interactions', value: 12400, icon: '🤖' },
            { label: 'DhinCoins Bet', value: 89100, icon: '🪙' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="text-center glass rounded-2xl p-6 glow-border stat-card-glow">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="font-display text-4xl font-bold gradient-text mb-2"><CounterUp end={stat.value} />+</div>
              <div className="text-white/40 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 py-32 px-6 section-portal">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="webgpu-badge">⚡ POWERED BY THREE.JS</div>
            </div>
            <h2 className="font-display text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">200,000+ Stars.</span><br /><span className="text-white/90">Zero Compromise.</span>
            </h2>
            <p className="text-white/50 text-xl max-w-2xl mx-auto mb-12">
              The galaxy you see right now is rendered in real-time. Parallax mouse tracking. Volumetric fog. Spiral arms.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[{ stat: '200K+', label: 'Stars rendered' }, { stat: '60fps', label: 'Performance' }, { stat: '10x', label: 'Visual quality' }].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} viewport={{ once: true }} className="glass rounded-2xl p-6 glow-border-cyan text-center anti-gravity-card">
                <div className="font-display text-5xl font-bold gradient-text-warm mb-2">{item.stat}</div>
                <div className="text-white font-semibold">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24 px-6 section-portal">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl md:text-6xl font-bold mb-4">Not a website.<br /><span className="gradient-text">A dimension.</span></h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">9 features judges have never seen combined in one platform.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02, boxShadow: `0 20px 60px ${feature.glow}33` }}
                className="glass rounded-2xl p-6 glow-border cursor-default group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={22} className="text-white" />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-32 px-6 section-portal">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="text-neon-orange text-sm font-mono uppercase tracking-widest">NEW FEATURE</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-6">Live Prediction<br /><span className="gradient-text-warm">Markets</span></h2>
            <p className="text-white/60 mb-8 leading-relaxed">Every webreel gets a betting pool. Users wager DhinCoins on outcomes. Real-time odds update as votes pour in.</p>
            <div className="flex items-center gap-4">
              <div className="glass rounded-xl px-4 py-3 glow-border-pink">
                <div className="text-sm text-white/40">Your Balance</div>
                <div className="font-display text-2xl font-bold gradient-text-warm">🪙 100 DC</div>
              </div>
              <GlowButton href="/register" size="sm">Start Betting</GlowButton>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass rounded-2xl p-6 glow-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold">Who wins IPL 2025?</h3>
              <span className="text-xs text-neon-green font-mono">🔴 LIVE</span>
            </div>
            {[{ team: 'Mumbai Indians', pct: 34, color: 'from-blue-500 to-blue-700' }, { team: 'CSK', pct: 28, color: 'from-yellow-500 to-orange-500' }, { team: 'RCB', pct: 22, color: 'from-red-500 to-pink-500' }, { team: 'KKR', pct: 16, color: 'from-purple-500 to-brand-500' }].map((opt, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between text-sm mb-1"><span className="text-white/80">{opt.team}</span><span className="text-white/50">{opt.pct}%</span></div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div className={`h-full rounded-full bg-gradient-to-r ${opt.color}`} initial={{ width: 0 }} whileInView={{ width: `${opt.pct}%` }} transition={{ duration: 1, delay: i * 0.1 }} viewport={{ once: true }} />
                </div>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-white/5 text-xs text-white/30 flex justify-between"><span>487 bets placed</span><span>12,340 DC wagered</span></div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 py-32 px-6 section-portal">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-neon-green text-sm font-mono uppercase tracking-widest">AI COMPOSED</span>
            <h2 className="font-display text-4xl md:text-6xl font-bold mt-3 mb-6">Every webreel.<br /><span className="gradient-text">Its own soundtrack.</span></h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto mb-16">AI analyzes your webreel and composes a unique track. Gemini + Tone.js synthesis.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="glass rounded-3xl p-8 glow-border max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-1 mb-8 h-16">
              {Array.from({ length: 32 }).map((_, i) => (
                <motion.div key={i} className="w-2 bg-gradient-to-t from-brand-500 via-neon-pink to-neon-cyan rounded-full"
                  animate={{ height: [10, 20 + Math.sin(i * 0.5) * 30 + Math.random() * 20, 10] }}
                  transition={{ duration: 1 + Math.random(), repeat: Infinity, ease: 'easeInOut' }} />
              ))}
            </div>
            <div className="text-white font-semibold mb-1">🎵 &quot;Epic Startup Journey&quot; — AI Generated</div>
            <div className="text-white/40 text-sm">120 BPM · C Minor · Synthesizer + Drums</div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 py-32 px-6 section-portal">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="glass rounded-3xl p-8 glow-border-cyan">
            <div className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center mb-6">
              <Upload className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <div className="text-white/60">Drop photo, voice note, or video</div>
              <div className="text-white/30 text-sm mt-1">AI builds your entire webreel</div>
            </div>
            <div className="space-y-2">
              {['📸 Analyzing your photo...', '🎨 Detecting emotion: Excited', '✍️ Generating title...', '🎵 Composing music...', '✅ Webreel ready!'].map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} viewport={{ once: true }}
                  className={`flex items-center gap-3 text-sm ${i === 4 ? 'text-neon-green font-semibold' : 'text-white/60'}`}>
                  <div className={`w-2 h-2 rounded-full ${i === 4 ? 'bg-neon-green' : 'bg-white/30'}`} />{step}
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="text-neon-cyan text-sm font-mono uppercase tracking-widest">ZERO TYPING</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-6">Upload.<br /><span className="gradient-text">AI does everything.</span></h2>
            <p className="text-white/60 leading-relaxed">One photo. One voice note. One video clip. Gemini Vision analyzes it, generates your title, tagline, color palette, music. Ready in under 30 seconds.</p>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="glass-heavy rounded-3xl p-16 glow-border relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <div className="portal-ring w-64 h-64" /><div className="portal-ring-reverse w-96 h-96 absolute" />
            </div>
            <div className="relative z-10">
              <h2 className="font-display text-5xl md:text-7xl font-bold mb-6"><span className="gradient-text">Your story</span><br />starts now.</h2>
              <p className="text-white/50 text-xl mb-10">Join the Black Clovers Dhindhora revolution.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <GlowButton href="/register" size="xl">Create Free Weboreel 🚀</GlowButton>
                <Link href="/explore" className="px-8 py-5 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all text-xl">Explore Galaxy →</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="relative z-10 py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-neon-pink flex items-center justify-center text-sm font-bold">D</div>
            <span className="font-display font-bold gradient-text">Dhindhora</span>
            <span className="text-white/20 text-sm">Black Clovers Dhindhora</span>
          </div>
          <div className="text-white/30 text-sm">Dhindhora A Story - powered by Team Black Clover</div>
        </div>
      </footer>
    </div>
  );
}
