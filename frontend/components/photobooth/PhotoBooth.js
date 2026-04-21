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
  sketch:      'saturate(0) contrast(1.8) brightness(1.1)',
};

const STYLE_CONFIGS = [
  { id: 'anime',       label: 'Anime',       emoji: '🎌', gradient: 'from-pink-500 to-rose-500' },
  { id: 'oilpainting', label: 'Oil Painting', emoji: '🖌️', gradient: 'from-amber-500 to-orange-500' },
  { id: 'cyberpunk',   label: 'Cyberpunk',    emoji: '🤖', gradient: 'from-cyan-500 to-blue-600' },
  { id: 'watercolor',  label: 'Watercolor',   emoji: '💧', gradient: 'from-sky-400 to-indigo-500' },
  { id: 'comic',       label: 'Comic',        emoji: '💥', gradient: 'from-yellow-400 to-orange-500' },
  { id: 'sketch',      label: 'Sketch',       emoji: '✏️', gradient: 'from-gray-400 to-gray-600' },
];

export default function PhotoBooth() {
  const videoRef      = useRef(null);
  const canvasRef     = useRef(null);
  const previewRef    = useRef(null);
  const cardRef       = useRef(null);
  const streamRef     = useRef(null);

  const [step, setStep]             = useState('start');
  const [selectedStyle, setStyle]   = useState('anime');
  const [capturedImage, setImage]   = useState(null);
  const [aiResult, setAiResult]     = useState(null);
  const [countdown, setCountdown]   = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [timer, setTimer]           = useState(null);

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      streamRef.current = stream;
      setStep('camera'); // The useEffect will catch this and attach the stream to videoRef
    } catch (err) {
      const msg = err.name === 'NotAllowedError' ? 'Camera permission denied!' : 'Could not open camera.';
      setCameraError(msg);
      toast.error(msg);
    }
  };

  // Attach camera stream when step changes to 'camera'
  useEffect(() => {
    if (step === 'camera' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(e => console.error('Play error:', e));
      };
    }
  }, [step]);

  // Countdown then capture
  const startCountdown = () => {
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
    setTimer(t);
  };

  const capturePhoto = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setImage(dataUrl);
    setStep('captured');

    streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  const analyzeWithAI = async () => {
    if (!capturedImage) return;
    setStep('analyzing');
    try {
      const { data } = await api.post('/photobooth/describe', {
        imageBase64: capturedImage,
        style: selectedStyle,
      });
      setAiResult(data.data);
      setStep('result');
      toast.success('🎨 Your portrait is ready!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI analysis failed. Try again!');
      setStep('captured');
    }
  };

  const downloadCard = async () => {
    if (downloading || !cardRef.current) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0d0d2b',
        scale: 2,
        useCORS: true,
        logging: false,
        ignoreElements: el => el.tagName === 'VIDEO',
      });
      const link = document.createElement('a');
      link.download = `dhindhora-portrait-${selectedStyle}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Portrait saved!');
    } catch {
      toast.error('Download failed — try sharing instead');
    } finally {
      setDownloading(false);
    }
  };

  const sharePortrait = async () => {
    const text = aiResult?.shareCaption || 'My AI portrait on Dhindhora!';
    if (navigator.share) {
      try { await navigator.share({ title: 'My AI Portrait', text, url: window.location.href }); }
      catch { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(text + ' ' + window.location.href);
      toast.success('Share text copied!');
    }
  };

  const resetAll = () => {
    clearInterval(timer);
    streamRef.current?.getTracks().forEach(t => t.stop());
    setStep('start');
    setImage(null);
    setAiResult(null);
    setCountdown(null);
    setCameraError('');
  };

  useEffect(() => () => {
    clearInterval(timer);
    streamRef.current?.getTracks().forEach(t => t.stop());
  }, [timer]);

  const styleCfg = STYLE_CONFIGS.find(s => s.id === selectedStyle) || STYLE_CONFIGS[0];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Style selector */}
      <div className="glass rounded-2xl p-4 border border-white/10">
        <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Choose Art Style</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {STYLE_CONFIGS.map(s => (
            <motion.button
              key={s.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStyle(s.id)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                selectedStyle === s.id
                  ? `bg-gradient-to-b ${s.gradient} border-transparent text-white shadow-lg`
                  : 'glass border-white/10 text-white/60 hover:border-white/25'
              }`}
            >
              <div className="text-2xl mb-1">{s.emoji}</div>
              <div className="text-xs font-bold">{s.label}</div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── START ──────────────────────────────────────────────────── */}
        {step === 'start' && (
          <motion.div key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass rounded-2xl border border-white/10 overflow-hidden"
          >
            <div className="p-10 flex flex-col items-center gap-6 text-center">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="text-8xl"
              >📸</motion.div>
              <div>
                <h2 className="text-3xl font-display font-black gradient-text mb-2">AI Photobooth</h2>
                <p className="text-white/50 max-w-md">
                  Take a selfie. AI transforms you into {styleCfg.emoji} {styleCfg.label} art instantly.
                  Get a unique shareable portrait card.
                </p>
              </div>
              {cameraError && <p className="text-red-400 text-sm">{cameraError}</p>}
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(168,85,247,0.5)' }}
                whileTap={{ scale: 0.95 }}
                onClick={startCamera}
                className="px-10 py-4 rounded-full bg-gradient-to-r from-brand-500 to-neon-pink text-white font-bold text-xl shadow-lg shadow-brand-500/40"
              >
                Open Camera 📸
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── CAMERA ─────────────────────────────────────────────────── */}
        {step === 'camera' && (
          <motion.div key="camera" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <div className="glass rounded-2xl border border-white/10 overflow-hidden">
              <div className="relative" style={{ aspectRatio: '4/3' }}>
                <video
                  ref={videoRef}
                  autoPlay muted playsInline
                  className="w-full h-full object-cover"
                  style={{
                    transform: 'scaleX(-1)',
                    filter: STYLE_FILTERS[selectedStyle] || 'none',
                    transition: 'filter 0.5s ease',
                  }}
                />

                <div className="absolute inset-0 pointer-events-none" style={{
                  backgroundImage: 'linear-gradient(rgba(168,85,247,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.1) 1px, transparent 1px)',
                  backgroundSize: '33.3% 33.3%',
                }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-64 border-2 border-brand-400/50 rounded-full" style={{ borderStyle: 'dashed' }} />
                  </div>
                </div>

                <div className="absolute top-3 right-3 glass rounded-full px-3 py-1 flex items-center gap-2">
                  <span className="text-sm">{styleCfg.emoji}</span>
                  <span className="text-white text-xs font-bold">{styleCfg.label} Preview</span>
                </div>

                <AnimatePresence>
                  {countdown !== null && (
                    <motion.div
                      key={countdown}
                      initial={{ scale: 2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/40"
                    >
                      <span className="text-white font-black" style={{ fontSize: 120 }}>{countdown}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-5 flex items-center justify-between">
                <button onClick={resetAll} className="text-white/40 hover:text-white/70 text-sm transition-colors">
                  ← Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={startCountdown}
                  disabled={countdown !== null}
                  className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl disabled:opacity-50"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-neon-pink" />
                </motion.button>
                <div className="text-white/40 text-xs text-right">
                  <div>{styleCfg.emoji}</div>
                  <div>{styleCfg.label}</div>
                </div>
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        )}

        {/* ── CAPTURED ───────────────────────────────────────────────── */}
        {step === 'captured' && capturedImage && (
          <motion.div key="captured" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="glass rounded-2xl border border-white/10 overflow-hidden"
          >
            <div className="p-5 space-y-5">
              <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <img
                  ref={previewRef}
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                  style={{ filter: STYLE_FILTERS[selectedStyle] || 'none' }}
                />
                <div className="absolute inset-0 flex items-end justify-start p-4">
                  <div className="glass rounded-xl px-4 py-2">
                    <span className="text-white/60 text-xs">Style: </span>
                    <span className="text-white font-bold text-sm">{styleCfg.emoji} {styleCfg.label}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={resetAll} className="flex-1 py-3 rounded-xl glass border border-white/10 text-white/60 text-sm font-semibold">
                  🔄 Retake
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={analyzeWithAI}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-neon-pink text-white text-sm font-bold shadow-lg shadow-brand-500/30">
                  🤖 Apply AI Style Transfer
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── ANALYZING ──────────────────────────────────────────────── */}
        {step === 'analyzing' && (
          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass rounded-2xl border border-white/10 p-14 text-center"
          >
            <div className="relative inline-block mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="w-20 h-20 rounded-full border-4 border-brand-500 border-t-transparent"
              />
              <div className="absolute inset-0 flex items-center justify-center text-3xl">
                {styleCfg.emoji}
              </div>
            </div>
            <p className="text-white font-bold text-2xl gradient-text mb-2">AI is painting your portrait...</p>
            <p className="text-white/40 text-sm">Analyzing features in {styleCfg.label} style</p>
            <div className="flex justify-center gap-2 mt-4">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-brand-500"
                  animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── RESULT ─────────────────────────────────────────────────── */}
        {step === 'result' && aiResult && capturedImage && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div ref={cardRef} style={{
              background: 'linear-gradient(135deg, #050510 0%, #1a0530 50%, #050510 100%)',
              borderRadius: 20,
              overflow: 'hidden',
              border: '1px solid rgba(168,85,247,0.3)',
            }}>
              <div style={{ display: 'flex', height: 5 }}>
                {(aiResult.colorPalette || ['#a855f7', '#ec4899', '#22d3ee']).map((c, i) => (
                  <div key={i} style={{ flex: 1, background: c }} />
                ))}
              </div>

              <div style={{ display: 'flex', gap: 20, padding: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flexShrink: 0, borderRadius: 16, overflow: 'hidden', width: 180, height: 220 }}>
                  <img
                    src={capturedImage}
                    alt="Portrait"
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                      filter: STYLE_FILTERS[selectedStyle] || 'none',
                    }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{styleCfg.emoji}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#a855f7', marginBottom: 4 }}>
                    {aiResult.title || 'Digital Portrait'}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
                    {styleCfg.label} Style
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: 12 }}>
                    {aiResult.description}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '8px 12px', marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>DOMINANT FEATURE</div>
                    <div style={{ fontSize: 13, color: '#ec4899', fontWeight: 600 }}>{aiResult.dominantFeature}</div>
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                    &ldquo;{aiResult.artisticNote}&rdquo;
                  </div>
                </div>
              </div>

              <div style={{ padding: '10px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>Made on Dhindhora ✨</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>{aiResult.shareCaption}</div>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={downloadCard} disabled={downloading}
                className="flex-1 py-3 rounded-xl glass border border-white/10 text-white text-sm font-semibold disabled:opacity-50">
                {downloading ? '⏳ Saving...' : '💾 Download Card'}
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={sharePortrait}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-neon-pink text-white text-sm font-bold">
                📤 Share Portrait
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={resetAll}
                className="w-12 h-12 rounded-xl glass border border-white/10 text-white/50 hover:text-white text-xl flex items-center justify-center">
                🔄
              </motion.button>
            </div>

            <p className="text-center text-white/30 text-xs">
              Want a different look?{' '}
              <button onClick={() => { setStep('start'); setImage(null); setAiResult(null); }} className="text-brand-400 hover:text-brand-300 underline">
                Retake with a new style
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
