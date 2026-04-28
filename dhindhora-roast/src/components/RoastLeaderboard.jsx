import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/api';

export default function RoastLeaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/roast/leaderboard').then(res => {
      setEntries(res.data?.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Loading leaderboard...</div>
  );

  if (!entries.length) return (
    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>No roasts yet. Be the first!</div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {entries.slice(0, 10).map((entry, i) => (
        <motion.div key={entry._id || i}
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.75rem 1rem', background: 'var(--gray-900)',
            border: `2px solid ${i < 3 ? 'var(--primary)' : 'var(--gray-700)'}`,
            boxShadow: i < 3 ? '3px 3px 0px var(--primary)' : 'none',
          }}>
          <div style={{
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem',
            color: i < 3 ? 'var(--black)' : 'var(--gray-400)',
            background: i < 3 ? 'var(--primary)' : 'transparent',
            border: i >= 3 ? '1px solid var(--gray-600)' : 'none',
          }}>{i + 1}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{entry.name}</div>
            <div style={{ color: 'var(--gray-400)', fontSize: '0.7rem' }}>
              {entry.verdict} • {entry.funnyNickname}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: 'var(--primary)' }}>{entry.roastScore}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
