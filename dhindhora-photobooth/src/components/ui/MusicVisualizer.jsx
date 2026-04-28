'use client';
import { motion } from 'framer-motion';

export default function MusicVisualizer({ bars = 5, playing = true }) {
  return (
    <div className="flex items-end gap-0.5 h-5">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div key={i} className="w-1.5 rounded-full bg-gradient-to-t from-brand-500 to-neon-pink"
          animate={playing ? { height: ['4px', `${8 + Math.random() * 12}px`, '4px'] } : { height: '4px' }}
          transition={{ duration: 0.6 + Math.random() * 0.4, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}
