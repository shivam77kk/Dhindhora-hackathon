'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';
import GlowButton from '@/components/ui/GlowButton';
import CounterUp from '@/components/ui/CounterUp';
import TypewriterText from '@/components/ui/TypewriterText';
import WebreelCard from '@/components/webreel/WebreelCard';
import { PlusCircle, TrendingUp, Eye, Star, DollarSign, Upload, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [reels, setReels] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [reelsRes, lbRes] = await Promise.allSettled([
        api.get('/weboreels/my/reels'),
        api.get('/leaderboard'),
      ]);
      setReels(reelsRes.status === 'fulfilled' ? (reelsRes.value.data.data?.slice(0, 3) || []) : []);
      setLeaderboard(lbRes.status === 'fulfilled' ? (lbRes.value.data.data?.slice(0, 5) || []) : []);
    } catch (e) { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const totalViews = reels.reduce((s, r) => s + (r.views || 0), 0);
  const stats = [
    { label: 'Total Reels', value: reels.length, icon: Star, color: '#6C63FF' },
    { label: 'Total Views', value: totalViews, icon: Eye, color: '#06B6D4' },
    { label: 'DhinCoins', value: user?.dhinCoins || 100, icon: DollarSign, color: '#F97316' },
    { label: 'Points', value: user?.points || 0, icon: TrendingUp, color: '#10B981' },
  ];

  const quickActions = [
    { href: '/dashboard/create', icon: PlusCircle, label: 'New Webreel', sub: 'Text or AI mode', color: 'from-brand-500 to-neon-purple' },
    { href: '/dashboard/create?mode=multimodal', icon: Upload, label: 'Upload & Create', sub: 'Photo · Voice · Video', color: 'from-neon-pink to-neon-orange' },
    { href: '/explore', icon: Zap, label: 'Explore', sub: 'Discover weboreels', color: 'from-neon-cyan to-neon-green' },
    { href: '/leaderboard', icon: Star, label: 'Leaderboard', sub: 'Check your rank', color: 'from-neon-orange to-neon-pink' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="portal-ring w-16 h-16 animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass-heavy rounded-3xl p-8 glow-border relative overflow-hidden">
        <div className="absolute inset-0 bg-anti-gravity opacity-50 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2"><div className="webgpu-badge">⚡ Black Clovers Dhindhora</div></div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👾</h1>
          <p className="text-white/50 mb-6"><TypewriterText texts={['Your story is waiting to be amplified.', 'Upload a photo and let AI create your webreel.', 'Place bets on prediction markets.', 'Earn DhinCoins for every interaction.']} /></p>
          <div className="flex flex-wrap gap-3">
            <GlowButton href="/dashboard/create">+ Create Webreel</GlowButton>
            <Link href="/dashboard/create?mode=multimodal" className="glass px-5 py-2.5 rounded-xl text-white/70 hover:text-white border border-white/10 hover:border-neon-cyan/40 transition-all text-sm flex items-center gap-2"><Upload size={16} /> Upload & Create</Link>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass rounded-2xl p-5 glow-border stat-card-glow cursor-default">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}22` }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
            </div>
            <div className="font-display text-3xl font-bold" style={{ color: stat.color }}><CounterUp end={stat.value} /></div>
            <div className="text-white/40 text-sm mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div>
        <h2 className="font-display text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <Link key={i} href={action.href}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }} className="glass rounded-2xl p-5 glow-border cursor-pointer group transition-all">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon size={20} className="text-white" />
                </div>
                <div className="font-semibold text-white text-sm">{action.label}</div>
                <div className="text-white/40 text-xs mt-0.5">{action.sub}</div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold">My Latest Reels</h2>
            <Link href="/dashboard/my-reels" className="text-sm text-brand-400 hover:text-brand-300">View all →</Link>
          </div>
          {reels.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center glow-border">
              <div className="text-5xl mb-4">🌌</div>
              <h3 className="font-display text-xl font-bold mb-2">Your galaxy is empty</h3>
              <p className="text-white/40 mb-6 text-sm">Create your first webreel.</p>
              <GlowButton href="/dashboard/create">Create First Webreel</GlowButton>
            </div>
          ) : (
            <div className="space-y-4">{reels.map((reel, i) => <WebreelCard key={reel._id} webreel={reel} compact index={i} />)}</div>
          )}
        </div>
        <div>
          <h2 className="font-display text-xl font-bold mb-4">Leaderboard</h2>
          <div className="glass rounded-2xl p-4 glow-border space-y-3">
            {leaderboard.length === 0 ? <div className="text-center text-white/40 py-8 text-sm">No data yet</div> : leaderboard.map((entry, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-slate-400 text-black' : i === 2 ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/60'}`}>{i + 1}</div>
                <div className="flex-1 min-w-0"><div className="text-sm font-medium text-white truncate">{entry.user?.name || 'Anonymous'}</div></div>
                <div className="gradient-text font-bold text-sm">{entry.totalScore}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
