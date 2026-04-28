import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import AirDrawingCanvas from '@/components/air-canvas/AirDrawingCanvas';
import ParticleBackground from '@/components/ui/ParticleBackground';

const gestures = [
  { icon: '☝️', label: 'Draw', color: 'var(--bau-red)' },
  { icon: '🤏', label: 'Recognize', color: 'var(--bau-blue)' },
  { icon: '✊', label: 'Pause', color: 'var(--bau-yellow)' }
];

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden font-body">
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: '!bg-[#141414] !text-white !border !border-white/10 !rounded-none !font-mono !text-sm',
          duration: 4000
        }} 
      />
      
      <ParticleBackground />

      {/* Main Grid Container */}
      <div className="relative z-10 min-h-screen p-4 md:p-8 flex flex-col pointer-events-none">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8 pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              <div className="w-4 h-4 bg-accent-red" />
              <div className="w-4 h-4 bg-accent-blue rounded-full" />
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[16px] border-accent-yellow" />
            </div>
            <h1 className="font-display font-bold text-2xl tracking-tight uppercase">Air Canvas</h1>
          </div>
          
          <div className="font-mono text-xs tracking-widest text-white/50 border border-white/10 px-3 py-1 bg-black/40 backdrop-blur">
            SYSTEM.ONLINE
          </div>
        </header>

        {/* Content Grid */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 pointer-events-auto">
          
          {/* Left Panel: Info & Controls */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Intro Card */}
            <div className="bauhaus-panel p-6 md:p-8 flex flex-col justify-between min-h-[300px]">
              <div>
                <h2 className="font-display font-bold text-4xl leading-none mb-4 uppercase">
                  Draw In <span className="accent-red">Space.</span>
                </h2>
                <p className="font-mono text-sm text-white/60 mb-8 leading-relaxed">
                  Use your hands to create art in mid-air. Our AI observes and interprets your gestures in real-time.
                </p>
              </div>
              
              <div className="w-full h-2 flex">
                <div className="h-full w-1/3 bg-accent-red" />
                <div className="h-full w-1/3 bg-accent-blue" />
                <div className="h-full w-1/3 bg-accent-yellow" />
              </div>
            </div>

            {/* Gesture Guide */}
            <div className="bauhaus-panel p-6 flex-1">
              <h3 className="font-mono text-xs uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Gestures</h3>
              <div className="grid grid-cols-1 gap-4">
                {gestures.map((g, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border border-white/5 bg-white/[0.02]">
                    <div className="text-3xl" style={{ textShadow: `0 0 20px ${g.color}` }}>{g.icon}</div>
                    <div className="flex-1">
                      <div className="font-display font-bold uppercase tracking-wider">{g.label}</div>
                    </div>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color }} />
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Panel: Canvas area */}
          <div className="lg:col-span-8 flex flex-col relative min-h-[60vh] lg:min-h-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--bau-red)] via-[var(--bau-blue)] to-[var(--bau-yellow)] opacity-20 blur-xl z-0 pointer-events-none" />
            <div className="relative z-10 flex-1 bauhaus-panel flex flex-col overflow-hidden bg-black/80">
              {/* Canvas Header */}
              <div className="border-b border-white/10 p-3 flex justify-between items-center bg-black/40">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent-red opacity-50" />
                  <div className="w-3 h-3 rounded-full bg-accent-yellow opacity-50" />
                  <div className="w-3 h-3 rounded-full bg-accent-blue opacity-50" />
                </div>
                <div className="font-mono text-[10px] tracking-[0.2em] text-white/40">VIEWPORT_01</div>
              </div>
              
              {/* Actual Canvas Container */}
              <div className="flex-1 relative w-full h-full min-h-[400px]">
                 <AirDrawingCanvas roomId="bauhaus-room-1" />
              </div>
            </div>
          </div>
          
        </main>
        
      </div>
    </div>
  );
}
