'use client';
import { useEffect, useState } from 'react';

export default function WebGPUBadge() {
  const [supported, setSupported] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        if ('gpu' in navigator) {
          const adapter = await navigator.gpu.requestAdapter();
          setSupported(!!adapter);
        } else { setSupported(false); }
      } catch { setSupported(false); }
    })();
  }, []);
  if (supported === null) return null;
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${supported ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-white/30 border border-white/10'}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${supported ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'}`} />
      {supported ? 'WebGPU ✓' : 'WebGL'}
    </div>
  );
}
