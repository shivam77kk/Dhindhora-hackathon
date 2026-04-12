'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import CursorEffect from '@/components/ui/CursorEffect';
import ScrollProgress from '@/components/ui/ScrollProgress';
import CounterUp from '@/components/ui/CounterUp';
import Link from 'next/link';
import GlowButton from '@/components/ui/GlowButton';
import { Trophy, Star, Crown } from 'lucide-react';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/leaderboard').then(res => setEntries(res.data.data || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <div className="min-h-screen bg-[#050510]">
      <CursorEffect /><ScrollProgress />
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-neon-pink flex items-center justify-center font-bold">D</div><span className="font-display text-xl font-bold gradient-text">Dhindhora</span></Link>
          <div className="flex items-center gap-3"><Link href="/login" className="text-white/70 text-sm px-4 py-2">Login</Link><GlowButton href="/register">Get Started</GlowButton></div>
        </div>
      </nav>
      <div className="pt-24 pb-12 px-6 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="font-display text-5xl font-bold mb-4"><span className="gradient-text">Leaderboard</span></h1>
          <p className="text-white/40 text-lg">Top creators in the Dhindhora galaxy</p>
        </motion.div>
        {loading ? <div className="flex justify-center py-20"><div className="portal-ring w-16 h-16 animate-spin" /></div> : entries.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl glow-border"><div className="text-6xl mb-4">🏆</div><h2 className="font-display text-2xl font-bold mb-2">Leaderboard is empty</h2><p className="text-white/40">Create weboreels to get on the board!</p></div>
        ) : (<div className="space-y-3">{entries.map((entry, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className={`glass rounded-2xl p-5 flex items-center gap-4 transition-all ${i < 3 ? 'glow-border' : 'border border-white/5'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-slate-400 text-black' : i === 2 ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/50'}`}>{i + 1}</div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-neon-pink flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
              {entry.user?.avatar ? <img src={entry.user.avatar} alt="" className="w-full h-full object-cover" /> : entry.user?.name?.[0]}
            </div>
            <div className="flex-1 min-w-0"><div className="font-semibold text-white truncate">{entry.user?.name || 'Anonymous'}</div><div className="text-xs text-white/40">@{entry.user?.username} · Level {entry.user?.level || 1}</div></div>
            <div className="text-right"><div className="font-display text-2xl font-bold gradient-text">{entry.totalScore}</div><div className="text-xs text-white/40">{entry.webreelsPublished} reels</div></div>
          </motion.div>))}</div>)}
      </div>
    </div>
  );
}
