'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSocket from '@/hooks/useSocket';
import api from '@/lib/api';

export default function RoastLeaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEntry, setNewEntry] = useState(null);
  const { socket } = useSocket();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onNewEntry = (entry) => {
      setNewEntry(entry._id);
      setTimeout(() => setNewEntry(null), 3000);
      setEntries(prev => {
        const updated = [entry, ...prev.filter(e => e._id !== entry._id)];
        return updated.sort((a, b) => b.roastScore - a.roastScore).slice(0, 25);
      });
    };
    socket.on('roast:new-entry', onNewEntry);
    return () => socket.off('roast:new-entry', onNewEntry);
  }, [socket]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/roast/leaderboard');
      setEntries(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error('Leaderboard fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="glass rounded-2xl p-5 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-lg gradient-text">🏆 Hall of Roasts</h3>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-white/30">Live</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-14 glass rounded-xl animate-pulse opacity-40" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-3">🎤</div>
          <p className="text-white/40 text-sm">Be the first to get roasted!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
          <AnimatePresence initial={false}>
            {entries.map((entry, i) => (
              <motion.div
                key={entry._id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className={`glass rounded-xl p-3 border transition-colors ${
                  newEntry === entry._id
                    ? 'border-brand-500/70 shadow-lg shadow-brand-500/20'
                    : 'border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl w-7 text-center flex-shrink-0">
                    {i < 3 ? medals[i] : <span className="text-white/30 text-sm font-bold">{i + 1}</span>}
                  </span>
                  <span className="text-xl flex-shrink-0">{entry.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold truncate">{entry.name}</div>
                    <div className="text-white/40 text-xs truncate">{entry.funnyNickname}</div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-brand-400 font-black text-base">{entry.roastScore}</div>
                    <div className="text-white/25 text-xs">pts</div>
                  </div>
                </div>
                {i < 5 && entry.roast && (
                  <p className="text-white/40 text-xs mt-2 pl-10 line-clamp-1 italic">"{entry.roast}"</p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
