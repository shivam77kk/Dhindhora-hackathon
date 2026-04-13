'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// html2canvas is imported lazily to avoid SSR issues
async function captureCard(element) {
  const { default: html2canvas } = await import('html2canvas');
  return html2canvas(element, {
    backgroundColor: '#0d0d2b',
    scale: 2,
    useCORS: true,
    allowTaint: false,
    logging: false,
    // Ignore elements that can't be captured (backdrop-filter)
    ignoreElements: (el) => el.classList?.contains('h2c-ignore'),
  });
}

const LEVELS = [
  { id: 'mild',   label: '🌿 Mild',   desc: 'Friendly teasing',  gradient: 'from-green-600 to-emerald-500' },
  { id: 'medium', label: '🌶️ Medium', desc: 'Properly roasted',   gradient: 'from-orange-600 to-amber-500' },
  { id: 'savage', label: '🔥 Savage', desc: 'No mercy mode',      gradient: 'from-red-600 to-rose-500'    },
];

export default function RoastEngine() {
  const [mode, setMode]             = useState('solo');   // 'solo' | 'battle'
  const [step, setStep]             = useState('input');  // 'input' | 'loading' | 'result' | 'battle'
  const [form, setForm]             = useState({ name: '', traits: '', roastLevel: 'medium' });
  const [battleForm, setBattleForm] = useState({
    person1: { name: '', traits: '' },
    person2: { name: '', traits: '' },
  });
  const [result, setResult]       = useState(null);
  const [battleData, setBattleData] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

  const handleGenerate = async () => {
    if (!form.name.trim()) { toast.error('Enter your name first!'); return; }
    setStep('loading');
    try {
      const { data } = await api.post('/roast/generate', {
        name: form.name.trim(),
        traits: form.traits.trim(),
        roastLevel: form.roastLevel,
      });
      setResult(data.data);
      setStep('result');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Roast failed. Try again!');
      setStep('input');
    }
  };

  const handleBattle = async () => {
    if (!battleForm.person1.name.trim() || !battleForm.person2.name.trim()) {
      toast.error('Both fighters need names!');
      return;
    }
    setStep('loading');
    try {
      const { data } = await api.post('/roast/battle', {
        person1: { name: battleForm.person1.name.trim(), traits: battleForm.person1.traits.trim() },
        person2: { name: battleForm.person2.name.trim(), traits: battleForm.person2.traits.trim() },
      });
      setBattleData(data.data);
      setStep('battle');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Battle failed!');
      setStep('input');
    }
  };

  const downloadCard = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const canvas = await captureCard(cardRef.current);
      const link = document.createElement('a');
      link.download = `roast-${(result?.funnyNickname || 'card').replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('🎉 Roast card saved!');
    } catch (err) {
      toast.error('Download failed. Try the share button instead.');
    } finally {
      setDownloading(false);
    }
  };

  const shareResult = async () => {
    const text = result?.shareText || 'I just got roasted on Dhindhora!';
    if (navigator.share) {
      try { await navigator.share({ title: '🔥 I got roasted!', text, url: window.location.href }); }
      catch {}
    } else {
      navigator.clipboard.writeText(text + ' ' + window.location.href);
      toast.success('Copied to clipboard!');
    }
  };

  const reset = () => {
    setStep('input');
    setResult(null);
    setBattleData(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Mode tabs */}
      <div className="flex gap-2 p-1 glass rounded-xl border border-white/10">
        {[{ id: 'solo', label: '🎯 Solo Roast' }, { id: 'battle', label: '⚔️ Roast Battle' }].map(m => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); reset(); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
              mode === m.id
                ? 'bg-gradient-to-r from-brand-500 to-neon-pink text-white shadow-lg'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── SOLO INPUT ──────────────────────────────────────────────────── */}
        {step === 'input' && mode === 'solo' && (
          <motion.div key="solo-input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="glass rounded-2xl p-6 space-y-5 border border-white/10"
          >
            <div className="text-center">
              <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-6xl mb-2">🔥</motion.div>
              <h2 className="text-2xl font-display font-black gradient-text">Get AI Roasted</h2>
              <p className="text-white/50 text-sm mt-1">Describe yourself. The AI will roast you (lovingly).</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/50 font-semibold block mb-1.5">YOUR NAME *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Rahul Sharma"
                  maxLength={60}
                  className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/25 border border-white/10 focus:border-brand-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 font-semibold block mb-1.5">ABOUT YOU (optional but way more fun)</label>
                <textarea
                  value={form.traits}
                  onChange={e => setForm(f => ({ ...f, traits: e.target.value }))}
                  placeholder="e.g. CS student, obsessed with late-night coding, chai addict, can't wake up before noon..."
                  rows={3}
                  maxLength={300}
                  className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/25 border border-white/10 focus:border-brand-500 outline-none transition-colors resize-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/50 font-semibold block mb-2">ROAST INTENSITY</label>
              <div className="grid grid-cols-3 gap-2">
                {LEVELS.map(lv => (
                  <button
                    key={lv.id}
                    onClick={() => setForm(f => ({ ...f, roastLevel: lv.id }))}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      form.roastLevel === lv.id
                        ? `bg-gradient-to-b ${lv.gradient} border-transparent text-white`
                        : 'glass border-white/10 text-white/60 hover:border-white/25'
                    }`}
                  >
                    <div className="font-bold text-sm">{lv.label}</div>
                    <div className="text-xs opacity-75 mt-0.5">{lv.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg shadow-lg shadow-red-500/30"
            >
              🔥 Roast Me!
            </motion.button>
          </motion.div>
        )}

        {/* ── BATTLE INPUT ─────────────────────────────────────────────────── */}
        {step === 'input' && mode === 'battle' && (
          <motion.div key="battle-input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="glass rounded-2xl p-6 space-y-5 border border-white/10"
          >
            <div className="text-center">
              <div className="text-6xl mb-2">⚔️</div>
              <h2 className="text-2xl font-display font-black gradient-text">Roast Battle</h2>
              <p className="text-white/50 text-sm">Two enter. The AI decides who gets roasted harder.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(['person1', 'person2']).map((p, i) => (
                <div key={p} className={`glass rounded-xl p-4 border ${i === 0 ? 'border-brand-500/40' : 'border-neon-pink/40'}`}>
                  <p className="text-sm font-bold mb-3 gradient-text">Fighter {i + 1} {i === 0 ? '🥊' : '🥋'}</p>
                  <input
                    value={battleForm[p].name}
                    onChange={e => setBattleForm(bf => ({ ...bf, [p]: { ...bf[p], name: e.target.value } }))}
                    placeholder="Name"
                    maxLength={40}
                    className="w-full glass rounded-lg px-3 py-2 text-white text-sm placeholder-white/25 border border-white/10 outline-none mb-2 focus:border-brand-500"
                  />
                  <textarea
                    value={battleForm[p].traits}
                    onChange={e => setBattleForm(bf => ({ ...bf, [p]: { ...bf[p], traits: e.target.value } }))}
                    placeholder="Describe them..."
                    rows={2}
                    maxLength={150}
                    className="w-full glass rounded-lg px-3 py-2 text-white text-sm placeholder-white/25 border border-white/10 outline-none resize-none focus:border-brand-500"
                  />
                </div>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleBattle}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-500 to-neon-pink text-white font-bold text-lg"
            >
              ⚔️ Let the Battle Begin!
            </motion.button>
          </motion.div>
        )}

        {/* ── LOADING ──────────────────────────────────────────────────────── */}
        {step === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass rounded-2xl p-14 text-center border border-white/10"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="text-6xl inline-block mb-5"
            >🔥</motion.div>
            <p className="text-white font-bold text-xl gradient-text">AI Consulting the Comedy Archives...</p>
            <p className="text-white/40 text-sm mt-2">This will take just a moment</p>
          </motion.div>
        )}

        {/* ── SOLO RESULT ──────────────────────────────────────────────────── */}
        {step === 'result' && result && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Capture card — use inline styles NOT tailwind for html2canvas reliability */}
            <div
              ref={cardRef}
              style={{
                background: 'linear-gradient(135deg, #0d0d2b 0%, #1a0530 50%, #0d0d2b 100%)',
                borderRadius: 20,
                padding: 24,
                border: '1px solid rgba(168,85,247,0.3)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 48 }}>{result.emoji}</span>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 900, fontSize: 22, background: 'linear-gradient(90deg,#a855f7,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {result.verdict}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>aka "{result.funnyNickname}"</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>ROAST SCORE</div>
                  <div style={{ color: '#a855f7', fontWeight: 900, fontSize: 36 }}>{result.roastScore}</div>
                </div>
              </div>

              {/* Roast block */}
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: 14, marginBottom: 10 }}>
                <div style={{ color: '#f87171', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>🔥 THE ROAST</div>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{result.roast}</p>
              </div>

              {/* Praise block */}
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <div style={{ color: '#34d399', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>💚 THE PRAISE</div>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{result.praise}</p>
              </div>

              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'SUPERPOWER', value: result.superpower, color: '#a855f7' },
                  { label: 'WEAKNESS', value: result.weakness, color: '#ec4899' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ color: s.color, fontWeight: 600, fontSize: 13 }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>Made with 🔥 on Dhindhora</div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={downloadCard}
                disabled={downloading}
                className="flex-1 py-3 rounded-xl glass border border-white/10 text-white text-sm font-semibold disabled:opacity-50"
              >
                {downloading ? '⏳ Saving...' : '💾 Download Card'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={shareResult}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-neon-pink text-white text-sm font-semibold"
              >
                📤 Share Roast
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={reset}
                className="w-12 h-12 rounded-xl glass border border-white/10 text-white/50 hover:text-white text-lg flex items-center justify-center"
              >🔄</motion.button>
            </div>
          </motion.div>
        )}

        {/* ── BATTLE RESULT ────────────────────────────────────────────────── */}
        {step === 'battle' && battleData && (
          <motion.div key="battle-result" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 border border-white/10 space-y-4"
          >
            <h3 className="text-center text-xl font-black gradient-text">⚔️ Battle Report</h3>
            {(battleData.rounds || []).map((round, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.25 }}
                className="glass rounded-xl p-4 border border-white/5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white/40">ROUND {round.round}</span>
                  <span className="text-sm">{round.crowdReaction}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass rounded-lg p-3">
                    <div className="text-xs text-brand-400 font-bold mb-1">Fighter 1 says:</div>
                    <p className="text-white/80 text-xs leading-relaxed">{round.person1Attack}</p>
                  </div>
                  <div className="glass rounded-lg p-3">
                    <div className="text-xs text-neon-pink font-bold mb-1">Fighter 2 says:</div>
                    <p className="text-white/80 text-xs leading-relaxed">{round.person1Attack}</p>
                  </div>
                </div>
                <div className="text-center text-xs text-white/50">
                  Round winner: <span className="font-bold text-white/80">
                    {round.roundWinner === 'tie' ? '🤝 TIE'
                      : round.roundWinner === 'person1' ? '🥊 Fighter 1'
                      : '🥋 Fighter 2'}
                  </span>
                </div>
              </motion.div>
            ))}
            <div className="glass rounded-xl p-5 text-center border border-brand-500/30">
              <div className="text-4xl mb-3">🏆</div>
              <div className="text-xl font-black gradient-text">
                {battleData.overallWinner === 'tie'
                  ? "IT'S A TIE!"
                  : battleData.overallWinner === 'person1'
                  ? `${battleForm.person1.name} WINS!`
                  : `${battleForm.person2.name} WINS!`}
              </div>
              <p className="text-white/60 text-sm mt-2">{battleData.finalVerdict}</p>
              <p className="text-brand-400 text-xs mt-1">{battleData.trophyLine}</p>
            </div>
            <button onClick={reset} className="w-full py-3 rounded-xl glass border border-white/10 text-white/60 hover:text-white font-semibold text-sm transition-colors">
              🔄 New Battle
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
