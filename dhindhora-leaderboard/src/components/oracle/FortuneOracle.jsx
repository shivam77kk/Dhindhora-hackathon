'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import useSocketStore from '@/store/socketStore';
import { connectSocket } from '@/lib/socket';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// ── 3 Mystical Questions ─────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 0,
    question: 'Choose your cosmic element',
    icon: '🌌',
    options: [
      { id: 'Fire',  emoji: '🔥', label: 'Fire',  desc: 'Passion & transformation' },
      { id: 'Water', emoji: '🌊', label: 'Water', desc: 'Flow & intuition' },
      { id: 'Earth', emoji: '🌿', label: 'Earth', desc: 'Stability & creation' },
      { id: 'Air',   emoji: '⚡', label: 'Air',   desc: 'Speed & ideas' },
      { id: 'Void',  emoji: '🌀', label: 'Void',  desc: 'Mystery & potential' },
    ],
  },
  {
    id: 1,
    question: 'When does your power peak?',
    icon: '⏰',
    options: [
      { id: 'Dawn',    emoji: '🌅', label: 'Dawn',     desc: 'Birth of possibilities' },
      { id: 'Dusk',    emoji: '🌆', label: 'Dusk',     desc: 'Twilight between worlds' },
      { id: 'Midnight',emoji: '🌙', label: 'Midnight', desc: 'When secrets emerge' },
      { id: 'Noon',    emoji: '☀️', label: 'Noon',     desc: 'Full illumination' },
      { id: 'Eclipse', emoji: '🌑', label: 'Eclipse',  desc: 'Convergence of forces' },
    ],
  },
  {
    id: 2,
    question: 'Choose your spirit path',
    icon: '🗺️',
    options: [
      { id: 'Hunter',   emoji: '🏹', label: 'Hunter',   desc: 'Pursue & conquer' },
      { id: 'Healer',   emoji: '💚', label: 'Healer',   desc: 'Restore & protect' },
      { id: 'Builder',  emoji: '⚒️', label: 'Builder',  desc: 'Create & manifest' },
      { id: 'Wanderer', emoji: '🧭', label: 'Wanderer', desc: 'Explore & discover' },
      { id: 'Oracle',   emoji: '👁️', label: 'Oracle',   desc: 'Know & foresee' },
    ],
  },
];

// ── Floating particles background ────────────────────────────────────────────
function StarParticles({ auraColor = '#a855f7' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const W = canvas.width;
    const H = canvas.height;

    const stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random(),
      dAlpha: (Math.random() - 0.5) * 0.015,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      stars.forEach(s => {
        s.x += s.vx; s.y += s.vy;
        s.alpha = Math.max(0.05, Math.min(1, s.alpha + s.dAlpha));
        if (s.x < 0 || s.x > W) s.vx *= -1;
        if (s.y < 0 || s.y > H) s.vy *= -1;
        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle   = auraColor;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [auraColor]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ── Option Card ───────────────────────────────────────────────────────────────
function OptionCard({ option, selected, onSelect, delay }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onSelect(option.id)}
      className={`relative p-4 rounded-2xl border-2 text-left transition-all group ${
        selected === option.id
          ? 'border-brand-500 bg-brand-500/15 shadow-lg shadow-brand-500/20'
          : 'border-white/10 glass hover:border-white/30'
      }`}
    >
      {selected === option.id && (
        <motion.div
          layoutId="selected-glow"
          className="absolute inset-0 rounded-2xl bg-brand-500/10"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      <div className="relative z-10">
        <span className="text-4xl block mb-2">{option.emoji}</span>
        <div className="font-bold text-white text-sm">{option.label}</div>
        <div className="text-white/50 text-xs mt-0.5">{option.desc}</div>
      </div>
      {selected === option.id && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">✓</span>
        </div>
      )}
    </motion.button>
  );
}

// ── Result Card ───────────────────────────────────────────────────────────────
function ResultCard({ result, onReset }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [liked, setLiked]             = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-150, 150], [8, -8]);
  const rotateY = useTransform(mouseX, [-150, 150], [-8, 8]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top  - rect.height / 2);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  const downloadCard = async () => {
    if (downloading || !cardRef.current) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, { backgroundColor: '#050510', scale: 2, logging: false });
      const link = document.createElement('a');
      link.download = `oracle-${result.archetype?.toLowerCase() || 'reading'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Fortune card saved!');
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const likeReading = async () => {
    if (liked || !result._id) return;
    try {
      await api.post(`/fortune/${result._id}/like`);
      setLiked(true);
      toast.success('💖 You loved this reading!');
    } catch { /* ignore */ }
  };

  // Trigger confetti on mount
  useEffect(() => {
    import('canvas-confetti').then(({ default: confetti }) => {
      confetti({ particleCount: 80, spread: 100, origin: { y: 0.7 }, colors: [result.auraColor, '#ec4899', '#22d3ee'] });
    }).catch(() => {});
  }, [result.auraColor]);

  const FIELDS = [
    { label: '🦋 Spirit Animal',   value: result.spiritAnimal    },
    { label: '⚡ Hidden Power',    value: result.hiddenPower     },
    { label: '🌊 Fatal Flaw',      value: result.fatalFlaw       },
    { label: '🗺️ Life Quest',      value: result.lifeQuest       },
    { label: '⚠️ Cosmic Warning',  value: result.warningSign     },
    { label: '🤝 Cosmic Alliance', value: result.cosmicAlliance  },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative cursor-pointer"
      >
        <div
          ref={cardRef}
          style={{
            background: `linear-gradient(135deg, #050510 0%, ${result.auraColor}22 50%, #050510 100%)`,
            borderRadius: 24,
            border: `1px solid ${result.auraColor}50`,
            padding: 28,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <StarParticles auraColor={result.auraColor} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 44 }}>{result.cardEmoji}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: result.auraColor, marginTop: 4 }}>
                  THE {result.archetype}
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                  {result.cosmicElement}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>LUCKY NUMBER</div>
                <div style={{ fontSize: 52, fontWeight: 900, color: result.auraColor, lineHeight: 1 }}>
                  {result.luckyNumber}
                </div>
              </div>
            </div>

            <div style={{
              background: `${result.auraColor}15`,
              border: `1px solid ${result.auraColor}30`,
              borderRadius: 14,
              padding: '14px 18px',
              marginBottom: 18,
            }}>
              <div style={{ fontSize: 10, color: result.auraColor, fontWeight: 700, marginBottom: 6, letterSpacing: '0.1em' }}>
                YOUR DESTINY
              </div>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
                {result.destinyQuote}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {FIELDS.map(f => (
                <div key={f.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{f.value}</div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 16 }}>
              Revealed by the Dhindhora Oracle 🔮
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-3 flex-wrap">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={likeReading} disabled={liked}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
            liked ? 'glass border border-pink-500/50 text-pink-400' : 'glass border border-white/10 text-white/60 hover:text-white'
          }`}>
          {liked ? '💖 Loved it!' : '🤍 Love this Reading'}
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={downloadCard} disabled={downloading}
          className="flex-1 py-3 rounded-xl glass border border-white/10 text-white text-sm font-semibold disabled:opacity-50">
          {downloading ? '⏳ Saving...' : '💾 Download Card'}
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onReset}
          className="w-12 h-12 rounded-xl glass border border-white/10 text-white/50 hover:text-white flex items-center justify-center text-xl">
          🔄
        </motion.button>
      </div>
    </div>
  );
}

// ── Main Oracle Component ─────────────────────────────────────────────────────
export default function FortuneOracle() {
  const [step, setStep]         = useState('intro');
  const [answers, setAnswers]   = useState(['', '', '']);
  const [qIndex, setQIndex]     = useState(0);
  const [result, setResult]     = useState(null);
  const [loadSteps, setLoadSteps] = useState([]);
  const { socket, setSocket } = useSocketStore();

  useEffect(() => {
    const s = connectSocket();
    setSocket(s);
  }, [setSocket]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('fortune:join-oracle');
    const onStep = (s) => setLoadSteps(prev => [...prev, s]);
    socket.on('fortune:step', onStep);
    return () => socket.off('fortune:step', onStep);
  }, [socket]);

  const selectAnswer = (value) => {
    const updated = [...answers];
    updated[qIndex] = value;
    setAnswers(updated);
  };

  const nextQuestion = () => {
    if (!answers[qIndex]) { toast('Make a selection!', { icon: '👆' }); return; }
    if (qIndex < 2) {
      setQIndex(qIndex + 1);
    } else {
      submit();
    }
  };

  const submit = async () => {
    setStep('loading');
    setLoadSteps([]);
    try {
      const { data } = await api.post('/fortune/generate', { answers });
      setResult(data.data);
      setStep('result');
    } catch (err) {
      toast.error(err.response?.data?.message || 'The oracle is silent. Try again.');
      setStep('questions');
    }
  };

  const reset = () => {
    setStep('intro');
    setAnswers(['', '', '']);
    setQIndex(0);
    setResult(null);
    setLoadSteps([]);
  };

  const q = QUESTIONS[qIndex];
  const progress = ((qIndex + (answers[qIndex] ? 1 : 0)) / 3) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {/* ── INTRO ─────────────────────────────────────────────────────── */}
        {step === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className="glass rounded-3xl border border-white/10 overflow-hidden"
          >
            <div className="relative p-12 text-center">
              <StarParticles auraColor="#a855f7" />
              <div className="relative z-10 space-y-6">
                <motion.div
                  animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="text-8xl"
                >🔮</motion.div>
                <div>
                  <h2 className="text-4xl font-display font-black gradient-text mb-3">The Oracle Awaits</h2>
                  <p className="text-white/60 max-w-sm mx-auto leading-relaxed">
                    Answer 3 mystical questions. The cosmos will reveal your spirit animal, hidden power, destiny quote, and cosmic fate.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.06, boxShadow: '0 0 50px rgba(168,85,247,0.6)' }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setStep('questions')}
                  className="px-12 py-5 rounded-full bg-gradient-to-r from-brand-500 via-violet-500 to-neon-pink text-white font-black text-xl shadow-2xl shadow-brand-500/40"
                >
                  Consult the Oracle ✨
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── QUESTIONS ─────────────────────────────────────────────────── */}
        {step === 'questions' && (
          <motion.div key={`q-${qIndex}`} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
            className="glass rounded-3xl border border-white/10 overflow-hidden"
          >
            <div className="relative p-6">
              <StarParticles auraColor={['#a855f7', '#ec4899', '#22d3ee'][qIndex]} />
              <div className="relative z-10 space-y-6">
                <div>
                  <div className="flex justify-between text-xs text-white/40 mb-2">
                    <span>Question {qIndex + 1} of 3</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-neon-pink"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-5xl mb-3">{q.icon}</div>
                  <h3 className="text-2xl font-display font-black text-white">{q.question}</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {q.options.map((opt, i) => (
                    <OptionCard
                      key={opt.id}
                      option={opt}
                      selected={answers[qIndex]}
                      onSelect={selectAnswer}
                      delay={i * 0.06}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  {qIndex > 0 ? (
                    <button onClick={() => setQIndex(qIndex - 1)} className="text-white/40 hover:text-white/70 text-sm transition-colors">
                      ← Previous
                    </button>
                  ) : <div />}
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={nextQuestion}
                    disabled={!answers[qIndex]}
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-brand-500 to-neon-pink text-white font-bold shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {qIndex < 2 ? 'Next →' : 'Reveal My Fate ✨'}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── LOADING ───────────────────────────────────────────────────── */}
        {step === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass rounded-3xl border border-white/10 overflow-hidden"
          >
            <div className="relative p-14 text-center">
              <StarParticles auraColor="#a855f7" />
              <div className="relative z-10 space-y-6">
                <motion.div
                  animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                  transition={{ rotate: { repeat: Infinity, duration: 3, ease: 'linear' }, scale: { repeat: Infinity, duration: 2 } }}
                  className="text-7xl inline-block"
                >🔮</motion.div>
                <div>
                  <p className="text-2xl font-display font-black gradient-text">The Oracle Speaks...</p>
                  <p className="text-white/40 text-sm mt-2">Reading the cosmic threads</p>
                </div>

                <div className="space-y-2 text-left max-w-xs mx-auto">
                  <AnimatePresence initial={false}>
                    {loadSteps.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 glass rounded-lg px-3 py-2"
                      >
                        <span className="w-4 h-4 rounded-full bg-brand-500 flex-shrink-0 flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </span>
                        <span className="text-white/70 text-xs">{s.label}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {loadSteps.length === 0 && (
                    <div className="flex justify-center gap-2 mt-2">
                      {[0,1,2].map(i => (
                        <motion.div key={i} className="w-2 h-2 rounded-full bg-brand-500"
                          animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── RESULT ────────────────────────────────────────────────────── */}
        {step === 'result' && result && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <ResultCard result={result} onReset={reset} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
