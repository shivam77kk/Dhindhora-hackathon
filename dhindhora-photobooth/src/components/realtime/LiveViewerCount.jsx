'use client';
import useSocketStore from '@/store/socketStore';
import { Users } from 'lucide-react';

export default function LiveViewerCount() {
  const { viewers, connected } = useSocketStore();
  return (
    <div className="flex items-center gap-2 glass rounded-xl px-3 py-1.5">
      <div className={`w-2 h-2 rounded-full ${connected ? 'bg-neon-green animate-pulse' : 'bg-white/30'}`} />
      <Users size={14} className="text-white/50" />
      <span className="text-xs text-white/50">{viewers || 0} online</span>
    </div>
  );
}
