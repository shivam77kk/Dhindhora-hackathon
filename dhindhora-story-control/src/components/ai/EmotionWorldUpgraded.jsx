'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSocket from '@/hooks/useSocket';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const EMOTION_THEMES = {
  happy:     { emoji:'😄', bg:'from-yellow-900/30 to-emerald-900/20', border:'#fbbf24', particle:'#fbbf24', label:'Joyful Sunshine',    music:'upbeat',     effects:['bounce'] },
  sad:       { emoji:'😢', bg:'from-blue-900/30 to-slate-900/20',    border:'#60a5fa', particle:'#93c5fd', label:'Gentle Rain',       music:'melancholy', effects:['slow']   },
  angry:     { emoji:'😡', bg:'from-red-900/30 to-orange-900/20',    border:'#ef4444', particle:'#f97316', label:'Fire Storm',         music:'intense',    effects:['shake','glitch'] },
  surprised: { emoji:'😮', bg:'from-purple-900/30 to-fuchsia-900/20',border:'#a855f7', particle:'#d946ef', label:'Cosmic Burst',       music:'dramatic',   effects:['pulse'] },
  neutral:   { emoji:'😐', bg:'from-cyan-900/20 to-blue-900/20',    border:'#00A8CC', particle:'#007EA7', label:'Calm Cosmos',        music:'ambient',    effects:[]         },
  fearful:   { emoji:'😨', bg:'from-orange-900/30 to-stone-900/20',  border:'#f97316', particle:'#fb923c', label:'Shadow Pulse',       music:'tense',      effects:['shake'] },
  disgusted: { emoji:'🤢', bg:'from-green-900/30 to-teal-900/20',    border:'#10b981', particle:'#34d399', label:'Strange Vibes',      music:'weird',      effects:['wobble'] },
};


function useParticleEngine(canvasRef, theme) {
  const animFrameRef = useRef(null);
  const particlesRef = useRef([]);

  const startParticles = useCallback((cfg) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    canvas.width  = canvas.offsetWidth  || 400;
    canvas.height = canvas.offsetHeight || 200;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    particlesRef.current = Array.from({ length: 55 }, () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      vx:    (Math.random() - 0.5) * (cfg.effects?.includes('shake') ? 3.5 : 1.2),
      vy:    (Math.random() - 0.5) * (cfg.effects?.includes('shake') ? 3.5 : 1.2),
      r:     Math.random() * 3 + 1,
      alpha: Math.random() * 0.6 + 0.2,
      dAlpha:(Math.random() - 0.5) * 0.012,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha = Math.max(0.1, Math.min(0.9, p.alpha + p.dAlpha));
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle   = cfg.particle;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  }, [canvasRef]);

  const stopParticles = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, []);

  return { startParticles, stopParticles };
}

export default function EmotionWorldUpgraded({ webreelId, broadcastEmotion = false }) {
  const videoRef     = useRef(null);
  const canvasRef    = useRef(null);
  const intervalRef  = useRef(null);
  const streamRef    = useRef(null);
  const prevEmotionRef = useRef('neutral');

  const [active, setActive]     = useState(false);
  const [emotion, setEmotion]   = useState('neutral');
  const [loading, setLoading]   = useState(false);
  const [faceFound, setFaceFound] = useState(false);
  const [history, setHistory]   = useState([]);
  const [shaking, setShaking]   = useState(false);
  const [aiTheme, setAiTheme]   = useState(null);
  const [modelMissing, setModelMissing] = useState(false);

  const { socket } = useSocket();
  const theme = EMOTION_THEMES[emotion] || EMOTION_THEMES.neutral;
  const { startParticles, stopParticles } = useParticleEngine(canvasRef, theme);

  
  useEffect(() => {
    if (!socket || !webreelId) return;
    const handler = ({ emotion: e }) => {
      if (EMOTION_THEMES[e] && e !== emotion) {
        setEmotion(e);
      }
    };
    socket.on('emotion:world-change', handler);
    return () => socket.off('emotion:world-change', handler);
  }, [socket, webreelId, emotion]);

  
  useEffect(() => {
    if (active) {
      startParticles(theme);
      if (theme.effects.includes('shake')) {
        setShaking(true);
        setTimeout(() => setShaking(false), 600);
      }
      
      document.dispatchEvent(new CustomEvent('emotion:changed', { detail: { emotion, theme } }));
    }
  }, [emotion, active, theme, startParticles]);

  const startDetection = async () => {
    setLoading(true);
    try {
      const faceapi = await import('face-api.js');
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        ]);
      } catch (err) {
        console.error('FaceAPI Models missing:', err);
        setModelMissing(true);
        throw new Error('AI models not found. Feature disabled.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await new Promise(res => { videoRef.current.onloadedmetadata = res; });
      videoRef.current.play();
      setActive(true);
      startParticles(theme);

      intervalRef.current = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;
        try {
          const det = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
            .withFaceExpressions();

          if (det?.expressions) {
            setFaceFound(true);
            const dominant = Object.entries(det.expressions).sort(([,a],[,b]) => b - a)[0][0];

            if (dominant !== prevEmotionRef.current) {
              prevEmotionRef.current = dominant;
              setEmotion(dominant);
              setHistory(h => [{ emotion: dominant, time: new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }) }, ...h.slice(0, 4)]);

              
              if (broadcastEmotion && socket && webreelId) {
                socket.emit('emotion:broadcast', { webreelId, emotion: dominant });
              }

              
              try {
                const intensity = Math.round((det.expressions[dominant] || 0.5) * 10);
                const { data } = await api.post('/ai/emotion-theme', { emotion: dominant, intensity });
                if (data?.data) setAiTheme(data.data);
              } catch {  }
            }
          } else {
            setFaceFound(false);
          }
        } catch {  }
      }, 2000);

      toast.success('🎭 Emotion World activated! Try different expressions!', { duration: 3500 });
    } catch (err) {
      const msg = err.name === 'NotAllowedError' ? 'Camera permission denied.' : err.message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const stopDetection = () => {
    clearInterval(intervalRef.current);
    stopParticles();
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
    setFaceFound(false);
    setAiTheme(null);
  };

  useEffect(() => () => stopDetection(), []);

  return (
    <motion.div
      animate={shaking ? { x: [0, -7, 7, -5, 5, 0] } : {}}
      transition={{ duration: 0.45 }}
      className={`glass rounded-2xl overflow-hidden border-2 transition-all duration-700 bg-gradient-to-br ${theme.bg}`}
      style={{ borderColor: theme.border + '55' }}
    >
      <div className="p-5 space-y-4">
        {}
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold gradient-text flex items-center gap-2">
            🎭 Emotion World
            {loading && <span className="w-3 h-3 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />}
          </h3>
          <AnimatePresence mode="wait">
            <motion.span
              key={emotion}
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              className="text-3xl"
            >{theme.emoji}</motion.span>
          </AnimatePresence>
        </div>

        {}
        <div className="relative rounded-xl overflow-hidden bg-black/50" style={{ height: 180 }}>
          <video
            ref={videoRef}
            autoPlay muted playsInline
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)', opacity: active ? 0.55 : 0 }}
          />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

          {}
          {active && (
            <div
              className="absolute inset-0 pointer-events-none transition-all duration-1000"
              style={{ background: `radial-gradient(ellipse at center, ${theme.particle}15 0%, transparent 70%)` }}
            />
          )}

          {}
          {!active && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
              <span className="text-4xl">{theme.emoji}</span>
              {modelMissing && (
                <p className="text-red-400 text-[10px] text-center px-4 bg-red-500/10 py-1 rounded-lg border border-red-500/20">
                  ⚠️ Models missing. Offline mode.
                </p>
              )}
              <motion.button
                whileHover={modelMissing ? {} : { scale: 1.04 }} whileTap={modelMissing ? {} : { scale: 0.96 }}
                onClick={startDetection}
                disabled={loading || modelMissing}
                className="px-5 py-2 rounded-full text-white font-bold text-sm shadow-lg disabled:opacity-30 disabled:grayscale"
                style={{ background: `linear-gradient(135deg, ${theme.border}, ${theme.particle})` }}
              >
                {loading ? '⏳ Loading...' : modelMissing ? '🎭 World Offline' : '🎭 Activate Emotion World'}
              </motion.button>
            </div>
          )}

          {}
          {active && (
            <div className="absolute top-2 left-2 glass rounded-full px-2 py-0.5 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${faceFound ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-xs text-white/60">{faceFound ? 'Face on' : 'No face'}</span>
            </div>
          )}
        </div>

        {}
        {active && (
          <AnimatePresence mode="wait">
            <motion.div
              key={emotion}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-center"
            >
              <p className="text-white font-semibold text-sm">{theme.label}</p>
              <div className="flex justify-center gap-1.5 mt-2">
                {[theme.border, theme.particle].map((c, i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.4 }}
                    className="w-5 h-5 rounded-full"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <p className="text-white/35 text-xs mt-1.5">🎵 {theme.music} mode</p>
              {aiTheme?.message && (
                <p className="text-white/50 text-xs mt-1 italic">"{aiTheme.message}"</p>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {}
        {history.length > 0 && (
          <div>
            <p className="text-xs text-white/30 mb-1.5">Recent emotions</p>
            <div className="flex gap-1.5 flex-wrap">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="glass rounded-full px-2 py-0.5 text-xs text-white/50 flex items-center gap-1 border border-white/5"
                >
                  <span>{EMOTION_THEMES[h.emotion]?.emoji}</span>
                  <span>{h.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {active && (
          <button onClick={stopDetection} className="w-full py-2 rounded-xl glass border border-red-500/30 text-red-400 text-xs font-semibold hover:text-red-300 transition-colors">
            ⏹ Deactivate
          </button>
        )}
      </div>
    </motion.div>
  );
}
