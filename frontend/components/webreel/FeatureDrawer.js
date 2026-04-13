'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';


const AirDrawingCanvas       = dynamic(() => import('../air-canvas/AirDrawingCanvas'), { ssr: false });
const EmotionWorldUpgraded   = dynamic(() => import('../ai/EmotionWorldUpgraded'), { ssr: false });
const AvatarMirror           = dynamic(() => import('../avatar/AvatarMirror'), { ssr: false });
const RoastEngine            = dynamic(() => import('../roast/RoastEngine'), { ssr: false });

const FEATURES = [
  { id: 'air-canvas',   name: '🎨 Air Drawing',      icon: '🪄', color: '#a855f7', desc: 'Draw shapes with hand gestures' },
  { id: 'emotion-world', name: '🌍 Emotion World',    icon: '🎭', color: '#10b981', desc: 'World reacts to your feelings' },
  { id: 'avatar-mirror', name: '🧬 Avatar Mirror',    icon: '✨', color: '#3b82f6', desc: 'Your face as a 3D avatar'      },
  { id: 'roast-me',      name: '🔥 Roast Engine',      icon: '🌶️', color: '#ef4444', desc: 'AI roasting and praising'      },
];

export default function FeatureDrawer({ webreelId }) {
  const [isOpen, setIsOpen]     = useState(false);
  const [activeTab, setActiveTab] = useState(null);

  return (
    <>
      {}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-24 right-5 z-[60] w-12 h-12 rounded-full glass border border-white/20 shadow-2xl flex items-center justify-center text-xl bg-gradient-to-br from-brand-500/20 to-neon-pink/20"
      >
        {isOpen ? '✕' : '🎪'}
      </motion.button>

      {}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-[50]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-[#050510]/95 z-[55] border-l border-white/10 shadow-emerald-500/10 shadow-2xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black gradient-text">Viral AI Lab</h2>
                  <p className="text-white/40 text-sm">Interactive WebReel Experiments</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white/60">✕ Close</button>
              </div>

              {}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {FEATURES.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setActiveTab(activeTab === f.id ? null : f.id)}
                    className={`text-left p-4 rounded-2xl border transition-all duration-300 ${
                      activeTab === f.id
                        ? 'bg-white/10 border-white/30 shadow-lg'
                        : 'glass border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="text-2xl mb-1">{f.icon}</div>
                    <div className="text-sm font-bold text-white mb-0.5">{f.name}</div>
                    <div className="text-[10px] text-white/40 leading-snug">{f.desc}</div>
                    {activeTab === f.id && (
                      <motion.div layoutId="active-dot" className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2" />
                    )}
                  </button>
                ))}
              </div>

              {}
              <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                <AnimatePresence mode="wait">
                  {!activeTab && (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center opacity-30 text-center px-10"
                    >
                      <div className="text-6xl mb-4">🧪</div>
                      <p className="text-sm text-white font-medium">Select a viral AI feature above to activate it in this WebReel session.</p>
                    </motion.div>
                  )}

                  {activeTab === 'air-canvas' && (
                    <motion.div key="air" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                      <AirDrawingCanvas roomId={webreelId} />
                    </motion.div>
                  )}

                  {activeTab === 'emotion-world' && (
                    <motion.div key="emo" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                      <EmotionWorldUpgraded webreelId={webreelId} broadcastEmotion />
                    </motion.div>
                  )}

                  {activeTab === 'avatar-mirror' && (
                    <motion.div key="ava" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                      <AvatarMirror />
                    </motion.div>
                  )}

                  {activeTab === 'roast-me' && (
                    <motion.div key="roast" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                      <RoastEngine />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {}
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] text-white/20 italic">
                <span>Collaborative Socket Connection: ACTIVE</span>
                <span>Dhindhora AI v2.4</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
