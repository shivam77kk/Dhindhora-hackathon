'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Eye, Star, Music, DollarSign } from 'lucide-react';
import { getTimeAgo } from '@/lib/utils';

export default function WebreelCard({ webreel, compact = false, index = 0 }) {
  const palette = webreel.colorPalette || ['#6C63FF', '#EC4899', '#06B6D4'];

  return (
    <Link href={`/webreel/${webreel._id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -4, scale: 1.01 }}
        className="glass rounded-2xl overflow-hidden glow-border cursor-pointer group transition-all"
      >
        <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${palette.join(', ')})` }} />
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-white truncate group-hover:gradient-text transition-all">{webreel.title}</h3>
              {webreel.tagline && <p className="text-white/40 text-xs mt-0.5 truncate">{webreel.tagline}</p>}
            </div>
            <span className={`px-2 py-0.5 rounded-lg text-xs capitalize ml-2 shrink-0 ${webreel.category === 'startup' ? 'bg-neon-green/20 text-neon-green' : webreel.category === 'story' ? 'bg-neon-pink/20 text-neon-pink' : 'bg-brand-500/20 text-brand-300'}`}>
              {webreel.category}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span className="flex items-center gap-1"><Eye size={12} /> {webreel.views || 0}</span>
            <span className="flex items-center gap-1"><Star size={12} /> {webreel.score || 0}</span>
            {webreel.musicStatus === 'ready' && <span className="flex items-center gap-1"><Music size={12} className="text-neon-green" /> AI Music</span>}
            {webreel.predictionMarket && <span className="flex items-center gap-1"><DollarSign size={12} className="text-neon-orange" /> Market</span>}
            <span className="ml-auto">{getTimeAgo(webreel.createdAt)}</span>
          </div>
          {!compact && webreel.creator && (
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-neon-pink flex items-center justify-center text-xs font-bold overflow-hidden">
                {webreel.creator.avatar ? <img src={webreel.creator.avatar} alt="" className="w-full h-full object-cover" /> : webreel.creator.name?.[0]}
              </div>
              <span className="text-xs text-white/50">@{webreel.creator.username}</span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
