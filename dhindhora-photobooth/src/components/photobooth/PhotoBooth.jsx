'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// ── CSS filter map per style ─────────────────────────────────────────────────
const STYLE_FILTERS = {
  anime:       'saturate(2) contrast(1.3) brightness(1.1) hue-rotate(15deg)',
  oilpainting: 'saturate(0.7) contrast(1.4) brightness(0.95) sepia(0.3)',
  cyberpunk:   'saturate(3) contrast(1.5) brightness(0.8) hue-rotate(200deg)',
  watercolor:  'saturate(0.5) contrast(0.9) brightness(1.15)',
  comic:       'saturate(2.5) contrast(1.8) brightness(1.0)',
  sketch:      'saturate(0) contrast(1.8) brightness(1.1) grayscale(100%)',
};

const STYLE_CONFIGS = [
  { id: 'anime',       label: 'Anime',       emoji: '🎌', color: '#FF2E93', class: 'neon' },
  { id: 'cyberpunk',   label: 'Cyberpunk',    emoji: '🤖', color: '#00F0FF', class: 'cyberpunk' },
  { id: 'oilpainting', label: 'Oil Paint',    emoji: '🖌️', color: '#FF8A00', class: 'polaroid' },
  { id: 'watercolor',  label: 'Watercolor',   emoji: '💧', color: '#8A2BE2', class: 'polaroid' },
  { id: 'comic',       label: 'Comic',        emoji: '💥', color: '#FFF500', class: 'neon' },
  { id: 'sketch',      label: 'Sketch',       emoji: '✏️', color: '#FFFFFF', class: 'polaroid' },
];

// Compare Slider Component
const CompareSlider = ({ beforeImage, afterImage, filter }) => {
  const [position, setPosition] = useState(50);
  const containerRef = useRef(null);

  const handleDrag = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    if (!x) return;
    const pos = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
    setPosition(pos);
  };

  return (
    <div 
      ref={containerRef}
      className="compare-slider-container w-full h-full cursor-ew-resize rounded-lg overflow-hidden relative"
      onMouseMove={(e) => e.buttons === 1 && handleDrag(e)}
      onTouchMove={handleDrag}
      onMouseDown={handleDrag}
    >
      {/* Before Image (Bottom) */}
      <img src={beforeImage} className="w-full h-full object-cover" alt="Original" />
      
      {/* After Image (Top / Clipped) */}
      <div 
        className="compare-slider-overlay pointer-events-none"
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      >
        <img src={afterImage} className="w-full h-full object-cover" alt="Transformed" style={{ filter }} />
      </div>

      {/* Slider Handle */}
      <div className="compare-slider-handle pointer-events-none" style={{ left: `${position}%` }}>
        <div className="compare-slider-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>
      </div>
    </div>
  );
};

export default function PhotoBooth() {
  const videoRef      = useRef(null);
  const resultCardRef = useRef(null);
  const streamRef     = useRef(null);

  const [step, setStep]             = useState('start');
  const [selectedStyle, setStyle]   = useState('anime');
  const [hoveredStyle, setHoveredStyle] = useState(null);
  const [capturedImage, setImage]   = useState(null);
  const [aiResult, setAiResult]     = useState(null);
  const [countdown, setCountdown]   = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [videoReady, setVideoReady] = useState(false);
  const timerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startCamera = async () => {
    setCameraError('');
    setVideoReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      });
      streamRef.current = stream;
      setStep('camera');
    } catch (err) {
      const msg = err.name === 'NotAllowedError' ? 'Camera permission denied!' : 'Could not open camera.';
      setCameraError(msg);
      toast.error(msg);
    }
  };

  // Callback ref: fires the instant the <video> element enters the DOM
  const videoCallbackRef = useCallback((videoEl) => {
    videoRef.current = videoEl;
    if (videoEl && streamRef.current) {
      videoEl.srcObject = streamRef.current;
      videoEl.onloadedmetadata = () => {
        videoEl.play()
          .then(() => setVideoReady(true))
          .catch(e => console.error('Play error:', e));
      };
    }
  }, []);

  const startCountdown = () => {
    if (!videoReady) {
      toast.error("Camera is still loading, please wait a moment...");
      return;
    }
    let count = 3;
    setCountdown(3);
    const t = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(t);
        setCountdown(null);
        capturePhoto();
      } else {
        setCountdown(count);
      }
    }, 1000);
    timerRef.current = t;
  };

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
        toast.error("Camera not ready yet. Please wait and try again.");
        return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Mirror the image
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setImage(dataUrl);
    
    // Flash effect
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.inset = '0';
    flash.style.background = 'white';
    flash.style.zIndex = '9999';
    flash.style.transition = 'opacity 0.4s ease-out';
    document.body.appendChild(flash);
    
    setTimeout(() => {
        flash.style.opacity = '0';
        setStep('captured');
        setTimeout(() => document.body.removeChild(flash), 400);
    }, 50);

  }, []);

  const proceedToTransform = () => {
    setStep('transforming');
    analyzeWithAI(capturedImage);
  };

  const analyzeWithAI = async (imgData) => {
    try {
      const { data } = await api.post('/photobooth/describe', {
        imageBase64: imgData,
        style: selectedStyle,
      });
      setAiResult(data.data);
      setStep('result');
      // Stop camera now that we have the result
      streamRef.current?.getTracks().forEach(t => t.stop());
      toast.success('🎨 Masterpiece complete!', { icon: '✨' });
    } catch (err) {
      let errMsg = err.response?.data?.message || 'Artistic block! The AI could not paint it.';
      if (errMsg.includes('429') || errMsg.includes('Quota')) {
        errMsg = 'The studio is too busy right now (API Quota Exceeded). Please try again in a moment!';
      } else if (errMsg.length > 100) {
        errMsg = 'An unexpected error occurred while painting.';
      }
      toast.error(errMsg);
      setStep('captured'); // go back to review on failure
    }
  };

  const downloadCard = async () => {
    if (downloading || !resultCardRef.current) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(resultCardRef.current, {
        backgroundColor: '#0a0a0f', scale: 2, useCORS: true, logging: false,
      });
      const link = document.createElement('a');
      link.download = `dhindhora-art-${selectedStyle}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Artwork saved to gallery!');
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const resetAll = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    setStep('start');
    setImage(null);
    setAiResult(null);
    setCountdown(null);
    setCameraError('');
  };

  const currentStyleCfg = STYLE_CONFIGS.find(s => s.id === selectedStyle) || STYLE_CONFIGS[0];
  const activeFilter = STYLE_FILTERS[hoveredStyle || selectedStyle] || 'none';

  return (
    <div className="w-full flex flex-col items-center">
      <AnimatePresence mode="wait">
        
        {/* ── START STATE: CAMERA PORTAL ────────────────────────────────────── */}
        {step === 'start' && (
          <motion.div 
            key="start" 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="flex flex-col items-center justify-center py-10"
          >
            <div className="relative group cursor-pointer" onClick={startCamera}>
              {/* Portal Outer Glow */}
              <div className="absolute -inset-10 bg-gradient-to-r from-[#FF2E93] via-[#00F0FF] to-[#FF8A00] rounded-full blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-pulse-glow" />
              
              {/* The Portal */}
              <div className="camera-portal w-64 h-64 shadow-[0_0_30px_rgba(255,46,147,0.3)] group-hover:scale-105 transition-transform duration-500">
                <div className="camera-portal-inner flex-col gap-4 group-hover:bg-[#f8f9fa] transition-colors duration-500">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: 'linear' }} className="text-7xl">
                    🌀
                  </motion.div>
                  <span className="font-display font-bold text-lg text-gray-800 tracking-widest uppercase">Enter Studio</span>
                </div>
              </div>
            </div>
            {cameraError && <p className="text-red-500 mt-8 font-mono">{cameraError}</p>}
          </motion.div>
        )}

        {/* ── CAMERA / STYLE SELECTION ──────────────────────────────────────── */}
        {step === 'camera' && (
          <motion.div 
            key="camera" 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -50, filter: 'blur(20px)' }}
            className="w-full max-w-5xl flex flex-col xl:flex-row gap-8 items-center xl:items-start"
          >
            {/* Left: Floating Canvas Frame */}
            <div className="flex-1 w-full relative z-10 flex justify-center perspective-1000">
              <motion.div 
                className={`canvas-frame ${currentStyleCfg.class} w-full max-w-2xl animate-float`}
                style={{ rotateY: 5, rotateX: 2 }}
              >
                <div className="relative rounded overflow-hidden aspect-[4/3] bg-gray-100 shadow-inner">
                  <video
                    ref={videoCallbackRef}
                    autoPlay muted playsInline
                    className="w-full h-full object-cover"
                    style={{
                      transform: 'scaleX(-1)',
                      filter: activeFilter,
                      transition: 'filter 0.5s ease-out',
                    }}
                  />
                  
                  {/* Grid Overlay */}
                  <div className="absolute inset-0 pointer-events-none opacity-20" style={{
                    backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                    backgroundSize: '33.33% 33.33%'
                  }} />

                  {/* Countdown Overlay */}
                  <AnimatePresence>
                    {countdown !== null && (
                      <motion.div
                        key={countdown}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 2, opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-20"
                      >
                        <span className="text-gray-900 font-black text-9xl" style={{ textShadow: `0 0 40px ${currentStyleCfg.color}` }}>
                          {countdown}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Frame Label */}
                <div className="mt-4 flex justify-between items-end">
                  <div className="font-brush text-3xl text-gray-800">
                    {hoveredStyle ? STYLE_CONFIGS.find(s=>s.id===hoveredStyle).label : currentStyleCfg.label}
                  </div>
                  <div className="text-sm font-mono text-gray-400">
                    ISO 400 • F/2.8
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Style Selector & Controls */}
            <div className="w-full xl:w-80 flex flex-col gap-6 z-20">
              <div className="studio-glass p-6 rounded-3xl flex flex-col gap-4 border border-gray-200 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                <h3 className="font-display text-xl font-bold text-gray-800 tracking-wide uppercase">
                  Artistic Palette
                </h3>
                
                <div className="flex flex-col gap-3">
                  {STYLE_CONFIGS.map(s => (
                    <motion.button
                      key={s.id}
                      onHoverStart={() => setHoveredStyle(s.id)}
                      onHoverEnd={() => setHoveredStyle(null)}
                      onClick={() => setStyle(s.id)}
                      whileHover={{ x: 10 }}
                      className={`relative flex items-center gap-4 p-3 rounded-2xl transition-all overflow-hidden group border border-transparent ${
                        selectedStyle === s.id ? 'bg-gray-100 border-gray-200 shadow-sm' : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Selection Indicator */}
                      {selectedStyle === s.id && (
                        <motion.div layoutId="activeStyle" className="absolute left-0 top-0 bottom-0 w-1 rounded-full" style={{ background: s.color }} />
                      )}
                      
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-white/50" style={{ background: `${s.color}20` }}>
                        {s.emoji}
                      </div>
                      
                      <div className="text-left flex-1">
                        <div className={`font-display font-bold text-lg transition-colors ${selectedStyle === s.id ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-800'}`}>
                          {s.label}
                        </div>
                      </div>
                      
                      <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: selectedStyle === s.id ? s.color : 'rgba(0,0,0,0.1)', background: selectedStyle === s.id ? s.color : 'transparent' }} />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button onClick={resetAll} className="p-4 studio-glass rounded-2xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all font-display uppercase tracking-widest text-xs flex items-center justify-center flex-1 border border-gray-200">
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: `0 10px 20px ${currentStyleCfg.color}40` }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startCountdown}
                  disabled={countdown !== null}
                  className="p-4 rounded-2xl flex-[2] text-white font-display font-bold uppercase tracking-wider shadow-md flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${currentStyleCfg.color}, #8A2BE2)` }}
                >
                  <span className="text-xl">📸</span> Capture
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── CAPTURED (REVIEW) ──────────────────────────────────────────────── */}
        {step === 'captured' && capturedImage && (
          <motion.div 
            key="captured" 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl flex flex-col items-center py-10 z-20"
          >
            <div className={`canvas-frame ${currentStyleCfg.class} w-full animate-float`}>
              <div className="relative rounded overflow-hidden aspect-[4/3] bg-gray-100 shadow-inner">
                <img 
                  src={capturedImage} 
                  alt="Captured" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-4 text-center">
                <div className="font-brush text-3xl text-gray-800">
                  Ready to Paint?
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8 w-full">
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={resetAll} 
                className="flex-1 py-4 rounded-2xl studio-glass text-gray-600 font-bold uppercase tracking-wider border border-gray-200"
              >
                🔄 Retake
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: `0 10px 20px ${currentStyleCfg.color}40` }} 
                whileTap={{ scale: 0.95 }}
                onClick={proceedToTransform} 
                className="flex-[2] py-4 rounded-2xl text-white font-bold uppercase tracking-wider shadow-md"
                style={{ background: `linear-gradient(135deg, ${currentStyleCfg.color}, #8A2BE2)` }}
              >
                ✨ Apply {currentStyleCfg.label}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── TRANSFORMING (ANIMATION) ──────────────────────────────────────── */}
        {step === 'transforming' && (
          <motion.div 
            key="transforming" 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 z-30"
          >
            {/* Swirling paint palette effect */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="absolute inset-0 rounded-full border-[10px] border-t-[#FF2E93] border-r-[#00F0FF] border-b-[#FF8A00] border-l-[#8A2BE2] opacity-60 mix-blend-multiply blur-[2px]" />
              <motion.div animate={{ rotate: -360, scale: [1.2, 1, 1.2] }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute inset-4 rounded-full border-[6px] border-t-[#00F0FF] border-r-[#FF8A00] border-b-[#8A2BE2] border-l-[#FF2E93] opacity-40 mix-blend-multiply blur-[1px]" />
              
              {/* Splatters */}
              {[...Array(8)].map((_, i) => (
                <motion.div key={i} className="absolute w-4 h-4 rounded-full bg-black animate-paint-splash" style={{
                  top: `${Math.random()*100}%`, left: `${Math.random()*100}%`,
                  animationDelay: `${Math.random()*2}s`, background: ['#FF2E93', '#00F0FF', '#FF8A00', '#8A2BE2'][i%4]
                }} />
              ))}
              
              <div className="text-6xl z-10 drop-shadow-md">🖌️</div>
            </div>
            
            <h2 className="text-4xl font-display font-black text-gray-800 mt-10 tracking-tight drop-shadow-sm">
              Painting your Masterpiece
            </h2>
            <p className="text-gray-500 font-sans mt-2 italic">Applying {currentStyleCfg.label} brushstrokes...</p>
          </motion.div>
        )}

        {/* ── RESULT: GALLERY VIEW ──────────────────────────────────────────── */}
        {step === 'result' && aiResult && capturedImage && (
          <motion.div 
            key="result" 
            initial={{ opacity: 0, y: 100 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className="w-full max-w-5xl z-20"
          >
            <div ref={resultCardRef} className="studio-glass rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row gap-8 border border-gray-200 shadow-xl relative overflow-hidden bg-white">
              
              {/* Background gradient splash based on style */}
              <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-[100px] opacity-10 pointer-events-none" style={{ background: currentStyleCfg.color }} />
              
              {/* Left: Split Compare View */}
              <div className="w-full md:w-1/2 flex-shrink-0">
                <div className="canvas-frame cyberpunk w-full p-2 bg-white border-gray-200 shadow-lg">
                  <div className="relative aspect-[4/3] rounded overflow-hidden">
                    <CompareSlider 
                      beforeImage={capturedImage} 
                      afterImage={capturedImage} // Ideally AI returns a new image URL, but since this relies on CSS filter for preview:
                      filter={STYLE_FILTERS[selectedStyle]} 
                    />
                  </div>
                  <div className="flex justify-between items-center mt-3 px-2">
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Original</span>
                    <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: currentStyleCfg.color }}>
                      {currentStyleCfg.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Gallery Details */}
              <div className="w-full md:w-1/2 flex flex-col justify-center gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: `${currentStyleCfg.color}15`, border: `1px solid ${currentStyleCfg.color}50` }}>
                      {currentStyleCfg.emoji}
                    </div>
                    <div className="text-sm font-mono tracking-widest uppercase text-gray-500">
                      Studio Exhibit
                    </div>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-black text-gray-900 leading-none tracking-tight drop-shadow-sm">
                    {aiResult.title || 'Digital Creation'}
                  </h2>
                </div>

                <p className="text-gray-700 font-sans text-lg leading-relaxed font-light border-l-2 pl-4" style={{ borderColor: currentStyleCfg.color }}>
                  {aiResult.description}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="text-xs font-mono text-gray-400 mb-1 uppercase">Prominent Feature</div>
                    <div className="font-bold" style={{ color: currentStyleCfg.color }}>{aiResult.dominantFeature}</div>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="text-xs font-mono text-gray-400 mb-1 uppercase">Palette</div>
                    <div className="flex h-6 rounded overflow-hidden mt-1 gap-1">
                      {(aiResult.colorPalette || ['#FF2E93', '#00F0FF', '#FF8A00']).map((c, i) => (
                        <div key={i} className="flex-1 rounded border border-black/5" style={{ background: c }} />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm font-brush text-gray-500 text-right mt-2 text-2xl">
                  ~ {aiResult.artisticNote}
                </div>
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex justify-center gap-4 mt-8">
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={resetAll} 
                className="px-8 py-4 rounded-full studio-glass border border-gray-200 font-display font-bold uppercase tracking-widest text-sm hover:bg-gray-50 text-gray-700 transition-colors"
              >
                New Canvas
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: `0 10px 20px ${currentStyleCfg.color}40` }} whileTap={{ scale: 0.95 }}
                onClick={downloadCard} 
                disabled={downloading}
                className="px-8 py-4 rounded-full font-display font-bold uppercase tracking-widest text-sm shadow-md flex items-center gap-2"
                style={{ background: currentStyleCfg.color, color: '#fff' }}
              >
                {downloading ? 'Exporting...' : <><span>📥</span> Save to Gallery</>}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
