'use client';
import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#050510] flex flex-col items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="portal-ring w-20 h-20 mb-6" />
      <div className="font-display text-2xl font-bold gradient-text mb-2">Dhindhora</div>
      <div className="text-white/30 text-sm">Loading the galaxy...</div>
    </div>
  );
}
