'use client';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import RoastEngine from '@/components/roast/RoastEngine';
import RoastLeaderboard from '@/components/roast/RoastLeaderboard';

export default function RoastPage() {
  return (
    <main className="min-h-screen bg-[#050510] relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[150px]" />
      </div>

      <Navbar />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Left Side: Roast Engine */}
          <div className="flex-[1.4] space-y-10">
            <header>
              <motion.h1
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-5xl md:text-7xl font-display font-black text-white"
              >
                Roast <span className="gradient-text">Me AI</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-white/40 text-lg mt-4 max-w-xl"
              >
                Witness the power of artificial sarcasm. Get a custom AI roast and praise card, or challenge a friend to an epic roast battle.
              </motion.p>
            </header>

            <RoastEngine />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-5 border border-white/5">
                <div className="text-2xl mb-2">🎭</div>
                <h4 className="text-white font-bold text-sm mb-1">Duality of AI</h4>
                <p className="text-white/30 text-xs">Our engine doesn't just roast—it balances every burn with a heartfelt compliment.</p>
              </div>
              <div className="glass rounded-2xl p-5 border border-white/5">
                <div className="text-2xl mb-2">📦</div>
                <h4 className="text-white font-bold text-sm mb-1">Exportable Cards</h4>
                <p className="text-white/30 text-xs">Instantly generate a high-res image card of your roast to share on social media.</p>
              </div>
            </div>
          </div>

          {/* Right Side: Leaderboard */}
          <div className="flex-1 w-full lg:sticky lg:top-32">
            <RoastLeaderboard />
          </div>

        </div>
      </div>
    </main>
  );
}
