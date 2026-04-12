'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import GlowButton from '@/components/ui/GlowButton';
import CounterUp from '@/components/ui/CounterUp';
import toast from 'react-hot-toast';
import { TrendingUp, DollarSign, Activity, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function PredictionsDashboard() {
  const { user } = useAuthStore();
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBets();
  }, []);

  const fetchBets = async () => {
    try {
      const res = await api.get('/predictions/user/bets');
      setBets(res.data.data || []);
    } catch (e) {
      toast.error('Failed to load predictions');
    } finally {
      setLoading(false);
    }
  };

  const activeBets = bets.filter(b => b.market?.isOpen);
  const resolvedBets = bets.filter(b => !b.market?.isOpen);
  const totalWon = resolvedBets.filter(b => b.won).reduce((sum, b) => sum + (b.coinsWon || 0), 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="portal-ring w-16 h-16 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      {}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-heavy rounded-3xl p-8 glow-border relative overflow-hidden">
        <div className="absolute inset-0 bg-anti-gravity opacity-50 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="webgpu-badge bg-gradient-to-r from-neon-orange to-neon-pink shadow-neon-orange/40">🎰 Prediction Markets</div>
            </div>
            <h1 className="font-display text-3xl font-bold gradient-text-warm mb-2">Your Betting Dashboard</h1>
            <p className="text-white/50">Track your wagers, odds, and DhinCoin earnings.</p>
          </div>
          <div className="glass rounded-2xl p-6 text-center glow-border-pink min-w-[200px]">
            <div className="text-white/40 text-sm mb-1 uppercase tracking-widest font-mono">DhinCoins</div>
            <div className="font-display text-4xl font-bold text-neon-orange flex items-center justify-center gap-2">
              🪙 <CounterUp end={user?.dhinCoins || 0} />
            </div>
          </div>
        </div>
      </motion.div>

      {}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Bets', value: activeBets.length, icon: Activity, color: '#06B6D4' },
          { label: 'Markets Won', value: resolvedBets.filter(b => b.won).length, icon: CheckCircle, color: '#10B981' },
          { label: 'Total Invested', value: bets.reduce((sum, b) => sum + b.coins, 0), icon: DollarSign, color: '#EC4899' },
          { label: 'Total Winnings', value: totalWon, icon: TrendingUp, color: '#F97316' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-5 glow-border cursor-default hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <stat.icon size={20} style={{ color: stat.color }} />
              <div className="text-white/40 text-sm">{stat.label}</div>
            </div>
            <div className="font-display text-2xl font-bold" style={{ color: stat.color }}>
              <CounterUp end={stat.value} />
            </div>
          </motion.div>
        ))}
      </div>

      {}
      <div>
        <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
          <Clock className="text-neon-cyan" size={20} /> Active Markets
        </h2>
        {activeBets.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center glow-border-cyan">
            <p className="text-white/40 mb-4">You have no active bets.</p>
            <GlowButton href="/explore" size="sm">Explore Webreels to Bet</GlowButton>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeBets.map((bet, i) => (
              <motion.div key={bet._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-5 glow-border-cyan flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="text-sm font-mono text-neon-cyan mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" /> IN PROGRESS
                  </div>
                  <h3 className="font-display font-semibold text-lg">{bet.market?.question || 'Unknown Market'}</h3>
                  <div className="text-white/40 text-sm mt-1">
                    You bet <span className="font-bold text-neon-orange">{bet.coins} DC</span> on "{bet.market?.options?.[bet.optionIndex]?.text || `Option ${bet.optionIndex + 1}`}"
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Link href={`/webreel/${bet.market?.webreelId}`} className="glass px-4 py-2 rounded-xl text-white/60 hover:text-white border border-white/10 hover:border-neon-cyan/50 transition-all text-sm">
                    View Market
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {}
      {resolvedBets.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="text-white/60" size={20} /> Past Results
          </h2>
          <div className="grid gap-4 opacity-70">
            {resolvedBets.map((bet, i) => (
              <motion.div key={bet._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                className={`glass rounded-2xl p-5 border ${bet.won ? 'border-neon-green/30' : 'border-red-500/30'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-semibold">{bet.market?.question}</h3>
                    <div className="text-sm mt-1">
                      Bet {bet.coins} DC on "{bet.market?.options?.[bet.optionIndex]?.text}"
                    </div>
                  </div>
                  <div className={`font-bold text-lg ${bet.won ? 'text-neon-green' : 'text-red-500'}`}>
                    {bet.won ? `+${bet.coinsWon} DC` : `-${bet.coins} DC`}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
