'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import useSocketStore from '@/store/socketStore';
import { connectSocket } from '@/lib/socket';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const QUESTIONS = [
  {
    id: 0, question: 'Choose your cosmic element', icon: '🌌',
    options: [
      { id: 'Fire', emoji: '🔥', label: 'Fire', desc: 'Passion & transformation' },
      { id: 'Water', emoji: '🌊', label: 'Water', desc: 'Flow & intuition' },
      { id: 'Earth', emoji: '🌿', label: 'Earth', desc: 'Stability & creation' },
      { id: 'Air', emoji: '⚡', label: 'Air', desc: 'Speed & ideas' },
      { id: 'Void', emoji: '🌀', label: 'Void', desc: 'Mystery & potential' },
    ],
  },
  {
    id: 1, question: 'When does your power peak?', icon: '⏰',
    options: [
      { id: 'Dawn', emoji: '🌅', label: 'Dawn', desc: 'Birth of possibilities' },
      { id: 'Dusk', emoji: '🌆', label: 'Dusk', desc: 'Twilight between worlds' },
      { id: 'Midnight', emoji: '🌙', label: 'Midnight', desc: 'When secrets emerge' },
      { id: 'Noon', emoji: '☀️', label: 'Noon', desc: 'Full illumination' },
      { id: 'Eclipse', emoji: '🌑', label: 'Eclipse', desc: 'Convergence of forces' },
    ],
  },
  {
    id: 2, question: 'Choose your spirit path', icon: '🗺️',
    options: [
      { id: 'Hunter', emoji: '🏹', label: 'Hunter', desc: 'Pursue & conquer' },
      { id: 'Healer', emoji: '💚', label: 'Healer', desc: 'Restore & protect' },
      { id: 'Builder', emoji: '⚒️', label: 'Builder', desc: 'Create & manifest' },
      { id: 'Wanderer', emoji: '🧭', label: 'Wanderer', desc: 'Explore & discover' },
      { id: 'Oracle', emoji: '👁️', label: 'Oracle', desc: 'Know & foresee' },
    ],
  },
];

function Ornament({ symbol = '✦' }) {
  return (
    <div className="ornament">
      <span className="text-vintage-gold/40 text-sm">{symbol}</span>
    </div>
  );
}

/* ── Tarot Option Card ─────────────────────────────────────────────── */
function OptionCard({ option, selected, onSelect, delay }) {
  const isActive = selected === option.id;
  return (
    <motion.button
      initial={{ opacity: 0, y: 20, rotateY: -15 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ delay, type: 'spring', stiffness: 180, damping: 18 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onSelect(option.id)}
      className={`tarot-mini holo-shimmer text-left cursor-pointer p-3 sm:p-4 ${isActive ? 'selected' : ''}`}
    >
      {/* Four ornamental corners */}
      <span className="tarot-corner-tr" />
      <span className="tarot-corner-bl" />

      <div className="relative z-10">
        <span className="text-3xl sm:text-4xl block mb-2">{option.emoji}</span>
        <div className={`font-display font-bold text-xs sm:text-sm ${isActive ? 'text-vintage-gold' : 'text-vintage-text'}`}>
          {option.label}
        </div>
        <div className="text-vintage-text-dim text-[10px] sm:text-xs mt-0.5 leading-snug italic">
          {option.desc}
        </div>
      </div>

      {isActive && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-vintage-gold flex items-center justify-center z-10"
        >
          <span className="text-vintage-bg text-[10px] font-bold">✓</span>
        </motion.div>
      )}
    </motion.button>
  );
}

/* ── Result Card ───────────────────────────────────────────────────── */
function ResultCard({ result, onReset }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [liked, setLiked] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-200, 200], [8, -8]);
  const rotateY = useTransform(mouseX, [-200, 200], [-8, 8]);

  const handleMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - r.left - r.width / 2);
    mouseY.set(e.clientY - r.top - r.height / 2);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  const downloadCard = async () => {
    if (downloading || !cardRef.current) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, { backgroundColor: '#12100e', scale: 2, logging: false });
      const link = document.createElement('a');
      link.download = `oracle-${result.archetype?.toLowerCase() || 'reading'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Fortune card saved!');
    } catch { toast.error('Download failed'); }
    finally { setDownloading(false); }
  };

  const likeReading = async () => {
    if (liked || !result._id) return;
    try { await api.post(`/fortune/${result._id}/like`); setLiked(true); toast.success('💛 Loved!'); }
    catch { /* ignore */ }
  };

  useEffect(() => {
    import('canvas-confetti').then(({ default: confetti }) => {
      confetti({ particleCount: 80, spread: 100, origin: { y: 0.65 }, colors: ['#c4a35a', '#b07a4b', '#d4b978', '#7a3b3b', '#4a7a72'] });
    }).catch(() => {});
  }, []);

  const accent = result.auraColor || '#c4a35a';
  const FIELDS = [
    { label: '🦋 Spirit Animal', value: result.spiritAnimal, icon: '🦋' },
    { label: '⚡ Hidden Power', value: result.hiddenPower, icon: '⚡' },
    { label: '🌊 Fatal Flaw', value: result.fatalFlaw, icon: '🌊' },
    { label: '🗺️ Life Quest', value: result.lifeQuest, icon: '🗺️' },
    { label: '⚠️ Warning', value: result.warningSign, icon: '⚠️' },
    { label: '🤝 Alliance', value: result.cosmicAlliance, icon: '🤝' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      >
        <div ref={cardRef} className="tarot-card p-5 sm:p-7">
          <div className="relative z-10">
            {/* Top Section */}
            <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
              <div>
                <div className="text-4xl sm:text-5xl mb-1">{result.cardEmoji}</div>
                <div className="text-xl sm:text-2xl font-display font-bold tracking-wide" style={{ color: accent }}>
                  THE {result.archetype}
                </div>
                <div className="text-vintage-text-dim text-xs mt-1 font-mono tracking-wider">{result.cosmicElement}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-vintage-text-dim tracking-[0.2em] uppercase font-mono mb-1">Lucky Number</div>
                <div className="text-4xl sm:text-5xl font-display font-black leading-none" style={{ color: accent }}>
                  {result.luckyNumber}
                </div>
              </div>
            </div>

            <Ornament symbol="⟡" />

            {/* Destiny Quote */}
            <div className="my-4 rounded-2xl p-4 sm:p-5" style={{ background: `${accent}0c`, border: `1px solid ${accent}25` }}>
              <div className="text-[9px] tracking-[0.2em] uppercase font-mono font-bold mb-2" style={{ color: accent }}>
                ✦ Your Destiny ✦
              </div>
              <p className="text-sm sm:text-base text-vintage-text italic leading-relaxed font-body">
                "{result.destinyQuote}"
              </p>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {FIELDS.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="rounded-xl p-3 holo-shimmer"
                  style={{ background: 'rgba(30,26,22,0.6)', border: '1px solid rgba(196,163,90,0.1)' }}
                >
                  <div className="text-[10px] text-vintage-text-dim font-mono mb-1">{f.label}</div>
                  <div className="text-xs sm:text-sm text-vintage-text leading-relaxed">{f.value}</div>
                </motion.div>
              ))}
            </div>

            <div className="text-center text-[9px] text-vintage-text-dim/30 mt-4 font-mono tracking-[0.3em] uppercase">
              ✦ Dhindhora Oracle ✦
            </div>
          </div>
        </div>
      </motion.div>

      {/* Buttons */}
      <div className="flex gap-2.5 flex-wrap">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={likeReading} disabled={liked}
          className={`flex-1 py-3 rounded-xl text-sm font-display font-semibold transition-all ${
            liked ? 'bg-vintage-gold/10 border border-vintage-gold/40 text-vintage-gold'
                  : 'bg-vintage-card border border-vintage-border text-vintage-text-dim hover:text-vintage-gold hover:border-vintage-gold/30'
          }`}>
          {liked ? '💛 Loved!' : '🤍 Love this'}
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={downloadCard} disabled={downloading}
          className="flex-1 py-3 rounded-xl bg-vintage-card border border-vintage-border text-vintage-text text-sm font-display font-semibold disabled:opacity-50 hover:border-vintage-gold/30 transition-all">
          {downloading ? '⏳ Saving…' : '💾 Save Card'}
        </motion.button>
        <motion.button whileHover={{ scale: 1.05, rotate: 180 }} whileTap={{ scale: 0.9 }} onClick={onReset}
          className="w-11 h-11 rounded-xl bg-vintage-card border border-vintage-border text-vintage-text-dim hover:text-vintage-gold flex items-center justify-center text-lg transition-all hover:border-vintage-gold/30">
          ↻
        </motion.button>
      </div>
    </div>
  );
}

/* ── Main Oracle ───────────────────────────────────────────────────── */
export default function FortuneOracle() {
  const [step, setStep] = useState('intro');
  const [answers, setAnswers] = useState(['', '', '']);
  const [qIndex, setQIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [loadSteps, setLoadSteps] = useState([]);
  const { socket, setSocket } = useSocketStore();

  useEffect(() => { const s = connectSocket(); setSocket(s); }, [setSocket]);
  useEffect(() => {
    if (!socket) return;
    socket.emit('fortune:join-oracle');
    const onStep = (s) => setLoadSteps((p) => [...p, s]);
    socket.on('fortune:step', onStep);
    return () => socket.off('fortune:step', onStep);
  }, [socket]);

  const selectAnswer = (v) => { const u = [...answers]; u[qIndex] = v; setAnswers(u); };
  const nextQuestion = () => {
    if (!answers[qIndex]) { toast('Pick one!', { icon: '👆' }); return; }
    if (qIndex < 2) setQIndex(qIndex + 1); else submit();
  };
  const submit = async () => {
    setStep('loading'); setLoadSteps([]);
    try {
      const { data } = await api.post('/fortune/generate', { answers });
      setResult(data.data); setStep('result');
    } catch (err) {
      toast.error(err.response?.data?.message || 'The oracle is silent.'); setStep('questions');
    }
  };
  const reset = () => { setStep('intro'); setAnswers(['', '', '']); setQIndex(0); setResult(null); setLoadSteps([]); };

  const q = QUESTIONS[qIndex];
  const progress = ((qIndex + (answers[qIndex] ? 1 : 0)) / 3) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">

        {/* ── INTRO ─────────────────────────────────────────────── */}
        {step === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.6 }} className="tarot-card overflow-hidden">
            <div className="relative p-8 sm:p-12 text-center z-10">
              <div className="space-y-6">
                <div className="inline-block mystic-pulse">
                  <motion.div
                    animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    className="text-6xl sm:text-8xl"
                  >🔮</motion.div>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-4xl font-display font-bold gradient-text mb-3">The Oracle Awaits</h2>
                  <p className="text-vintage-text-dim max-w-sm mx-auto leading-relaxed text-sm sm:text-base italic">
                    Answer three mystical questions and let the ancient cosmos unveil your hidden destiny.
                  </p>
                </div>

                <Ornament symbol="❖" />

                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setStep('questions')}
                  className="btn-oracle px-10 sm:px-14 py-4 sm:py-5 rounded-full font-display font-bold text-base sm:text-lg text-vintage-bg tracking-wide"
                >
                  Consult the Oracle ✦
                </motion.button>

                <div className="flex justify-center gap-6 text-vintage-text-dim/30 text-2xl pt-2">
                  {['♈', '♉', '♊', '♋', '♌', '♍'].map((z, i) => (
                    <motion.span key={i} animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}>{z}</motion.span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── QUESTIONS ─────────────────────────────────────────── */}
        {step === 'questions' && (
          <motion.div key={`q-${qIndex}`}
            initial={{ opacity: 0, x: 60, rotateY: 8 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -60, rotateY: -8 }}
            transition={{ duration: 0.45, type: 'spring', damping: 20 }}
            className="tarot-card overflow-hidden">
            <div className="relative p-5 sm:p-7 z-10">
              <div className="space-y-5">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-[10px] text-vintage-text-dim mb-2 font-mono tracking-widest uppercase">
                    <span>Question {qIndex + 1} / 3</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 bg-vintage-bg rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-vintage-gold to-vintage-amber"
                      animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                  </div>
                </div>

                <div className="text-center">
                  <motion.div className="text-4xl sm:text-5xl mb-2"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 3 }}>{q.icon}</motion.div>
                  <h3 className="text-lg sm:text-2xl font-display font-bold text-vintage-text">{q.question}</h3>
                </div>

                <Ornament symbol="•" />

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {q.options.map((opt, i) => (
                    <OptionCard key={opt.id} option={opt} selected={answers[qIndex]} onSelect={selectAnswer} delay={i * 0.06} />
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  {qIndex > 0 ? (
                    <button onClick={() => setQIndex(qIndex - 1)}
                      className="text-vintage-text-dim hover:text-vintage-gold text-sm transition-colors font-display">
                      ← Back
                    </button>
                  ) : <div />}
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={nextQuestion}
                    disabled={!answers[qIndex]}
                    className="btn-oracle px-7 sm:px-9 py-2.5 sm:py-3 rounded-full font-display font-bold text-sm text-vintage-bg
                      disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none">
                    {qIndex < 2 ? 'Next →' : 'Reveal My Fate ✦'}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── LOADING ───────────────────────────────────────────── */}
        {step === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="tarot-card overflow-hidden">
            <div className="relative p-10 sm:p-14 text-center z-10">
              <div className="space-y-6">
                <div className="inline-block mystic-pulse">
                  <motion.div
                    animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                    transition={{ rotate: { repeat: Infinity, duration: 4, ease: 'linear' }, scale: { repeat: Infinity, duration: 2 } }}
                    className="text-5xl sm:text-7xl inline-block">🔮</motion.div>
                </div>

                <div>
                  <p className="text-xl sm:text-2xl font-display font-bold gradient-text">The Oracle Speaks…</p>
                  <p className="text-vintage-text-dim text-xs mt-2 italic font-mono">Reading the ancient threads</p>
                </div>

                <Ornament symbol="⟡" />

                <div className="space-y-2 text-left max-w-xs mx-auto">
                  <AnimatePresence initial={false}>
                    {loadSteps.map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2.5 bg-vintage-card/60 rounded-lg px-3 py-2 border border-vintage-border">
                        <span className="w-4 h-4 rounded-full bg-vintage-gold/80 flex-shrink-0 flex items-center justify-center">
                          <span className="text-vintage-bg text-[10px] font-bold">✓</span>
                        </span>
                        <span className="text-vintage-text text-xs">{s.label}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {loadSteps.length === 0 && (
                    <div className="flex justify-center gap-2.5 mt-3">
                      {[0, 1, 2].map((i) => (
                        <motion.div key={i} className="w-2.5 h-2.5 rounded-full bg-vintage-gold/60"
                          animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── RESULT ────────────────────────────────────────────── */}
        {step === 'result' && result && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
            <ResultCard result={result} onReset={reset} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
