'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';

const EmotionWorldUpgraded = dynamic(() => import('@/components/ai/EmotionWorldUpgraded'), { ssr: false });

export default function StoryControlPage() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: "In the depths of the neon nebula, your emotions dictate the reality. How do you feel about the horizon ahead?", emoji: '✨' }
  ]);
  const [input, setInput] = useState('');

  const appendStory = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', content: "The world shifts as your words take form. The shadows recede, leaving only the stardust of your intentions.", emoji: '🌌' }]);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-[#050510] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] bg-repeat opacity-20" />
      </div>

      <Navbar />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left: Emotion World Control */}
          <div className="flex-1 lg:sticky lg:top-32 h-fit">
            <header className="mb-8">
              <h1 className="text-4xl font-black text-white mb-2">Story <span className="gradient-text">Alchemist</span></h1>
              <p className="text-white/40 text-sm">Your expressions and voice control the world theme and narrative flow.</p>
            </header>
            
            <EmotionWorldUpgraded webreelId="story-collab-x" broadcastEmotion />

            <div className="mt-6 glass rounded-xl p-4 border border-white/5 space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-widest opacity-40">System Status</h4>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Audio Reactive Engine</span>
                <span className="text-green-400">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Emotion Mapping</span>
                <span className="text-brand-400">SYNCED</span>
              </div>
            </div>
          </div>

          {/* Right: Interactive Story Feed */}
          <div className="flex-[1.5] flex flex-col h-[700px] glass rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
              <span className="text-sm font-bold text-white uppercase tracking-tighter">Hyper-Interactive Narrative</span>
              <span className="text-[10px] text-white/30">Gemini 1.5 Flash Enabled</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-4 ${
                    m.role === 'user' 
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                      : 'glass border border-white/10 text-white/80'
                  }`}>
                    {m.role === 'ai' && <div className="text-2xl mb-2">{m.emoji}</div>}
                    <p className="text-sm leading-relaxed">{m.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input area */}
            <form onSubmit={appendStory} className="p-4 bg-black/40 border-t border-white/10 flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your story path..."
                className="flex-1 glass rounded-xl px-4 py-3 text-sm text-white focus:outline-none border border-white/10"
              />
              <button className="h-12 w-12 rounded-xl bg-gradient-to-r from-brand-500 to-neon-pink text-white flex items-center justify-center font-bold">
                ➜
              </button>
            </form>
          </div>

        </div>
      </div>
    </main>
  );
}
