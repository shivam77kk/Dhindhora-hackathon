import { motion } from 'framer-motion';
import AvatarMirror from '@/components/avatar/AvatarMirror';

export default function AvatarMirrorPage() {
  return (
    <main className="min-h-screen relative overflow-hidden font-['Fredoka']">
      {/* Super magical floating background items */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Floating Stars */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute text-yellow-300 floating-element drop-shadow-lg"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 30 + 20}px`,
              animationDelay: `${Math.random() * 5}s`
            }}
          >
            ✨
          </motion.div>
        ))}
        {/* Floating Orbs */}
        <motion.div 
          animate={{ y: [0, -40, 0], x: [0, 20, 0] }} 
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-48 h-48 bg-gradient-to-tr from-pink-500 to-orange-400 rounded-full opacity-40 mix-blend-screen blur-2xl" 
        />
        <motion.div 
          animate={{ y: [0, 50, 0], x: [0, -30, 0] }} 
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute bottom-20 right-10 w-64 h-64 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full opacity-40 mix-blend-screen blur-2xl" 
        />
        <motion.div 
          animate={{ y: [0, -30, 0], x: [0, 40, 0] }} 
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/3 w-56 h-56 bg-gradient-to-tr from-yellow-400 to-green-400 rounded-full opacity-30 mix-blend-screen blur-2xl" 
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-20">
        <header className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.6 }}
            className="inline-block relative"
          >
            <div className="absolute -top-6 -right-8 text-4xl pulse-glow">🪄</div>
            <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-[6px_6px_0_#1e1b4b] tracking-wider">
              MAGIC <span className="text-pink-400">MIRROR</span>
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white text-2xl mt-6 max-w-2xl mx-auto font-bold bg-[#1e1b4b]/40 py-2 px-6 rounded-full border-2 border-white/20 backdrop-blur-md"
          >
            A colorful 3D buddy that copies your every move! 🎭
          </motion.p>
        </header>

        <motion.section 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="cartoon-card p-4 md:p-8 mb-16 relative bg-[#fffbfa] z-20"
        >
          {/* Decorative pins */}
          <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-yellow-400 border-4 border-[#1e1b4b] shadow-[4px_4px_0_#1e1b4b] z-20 flex items-center justify-center text-xl">⭐</div>
          <div className="absolute -bottom-4 -right-4 w-10 h-10 rounded-full bg-pink-400 border-4 border-[#1e1b4b] shadow-[4px_4px_0_#1e1b4b] z-20 flex items-center justify-center text-xl">🎈</div>
          <AvatarMirror />
        </motion.section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <motion.div 
            whileHover={{ scale: 1.02, rotate: -1 }}
            className="cartoon-card p-8 bg-gradient-to-br from-indigo-100 to-purple-100"
          >
            <h3 className="text-4xl font-black text-[#1e1b4b] mb-6 flex items-center gap-3 drop-shadow-[2px_2px_0_white]">
              <span className="text-5xl">🎪</span> How to play
            </h3>
            <div className="space-y-6">
              {[
                { title: 'Face Magic', text: 'Step into the light so the mirror can see you!', color: 'bg-yellow-400' },
                { title: 'Show Emotion', text: 'Smile, frown, or act surprised!', color: 'bg-green-400' },
                { title: 'Watch it Morph', text: 'Your 3D buddy changes color and shape instantly!', color: 'bg-cyan-400' },
              ].map((step, i) => (
                <div key={i} className="flex gap-4 items-center bg-white p-4 rounded-2xl border-4 border-[#1e1b4b] shadow-[4px_4px_0_#1e1b4b]">
                  <div className={`w-12 h-12 rounded-full ${step.color} border-4 border-[#1e1b4b] flex items-center justify-center font-black text-[#1e1b4b] text-xl shrink-0 shadow-[2px_2px_0_#1e1b4b]`}>
                    {i+1}
                  </div>
                  <div>
                    <h4 className="text-[#1e1b4b] font-black text-xl">{step.title}</h4>
                    <p className="text-slate-600 font-bold leading-relaxed text-sm">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, rotate: 1 }}
            className="cartoon-card p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-pink-100 to-orange-100 relative overflow-hidden"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-300 rounded-full mix-blend-multiply opacity-50 blur-xl"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-yellow-300 rounded-full mix-blend-multiply opacity-50 blur-xl"></div>
            <motion.div 
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="text-9xl mb-6 drop-shadow-[6px_6px_0_rgba(30,27,75,0.2)]"
            >
              👾
            </motion.div>
            <h3 className="text-4xl font-black text-[#1e1b4b] mb-2 drop-shadow-[2px_2px_0_white]">Mirror Bot 3000</h3>
            <p className="text-slate-600 font-bold text-xl bg-white px-4 py-1 rounded-full border-2 border-[#1e1b4b]">Ready to copycat!</p>
            
            <div className="mt-8 flex gap-3">
              {['😄', '😢', '😡', '😮', '🤢'].map((emoji, i) => (
                <motion.div 
                  key={i}
                  animate={{ y: [0, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.15 }}
                  className="w-14 h-14 bg-white rounded-full border-4 border-[#1e1b4b] flex items-center justify-center text-3xl shadow-[4px_4px_0_#1e1b4b]"
                >
                  {emoji}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
