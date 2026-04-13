'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import WebreelCard from '@/components/webreel/WebreelCard';
import toast from 'react-hot-toast';

export default function MyReelsPage() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/webreels/my/reels').then(res => setReels(res.data.data || [])).catch(() => toast.error('Failed to load reels')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="portal-ring w-16 h-16 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold gradient-text mb-1">My Weboreels</h1>
        <p className="text-white/40">{reels.length} webreel{reels.length !== 1 ? 's' : ''} created</p>
      </motion.div>
      {reels.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center glow-border">
          <div className="text-6xl mb-4">🌌</div>
          <h2 className="font-display text-2xl font-bold mb-2">No weboreels yet</h2>
          <p className="text-white/40 mb-6">Create your first webreel and watch the universe expand.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {reels.map((reel, i) => <WebreelCard key={reel._id} webreel={reel} index={i} />)}
        </div>
      )}
    </div>
  );
}
