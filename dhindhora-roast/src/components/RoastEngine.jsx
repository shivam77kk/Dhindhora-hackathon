import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import api from '../lib/api';

const LEVELS = [
  { id: 'mild', label: '🌿 MILD', desc: 'Friendly teasing' },
  { id: 'medium', label: '🌶️ MEDIUM', desc: 'Properly roasted' },
  { id: 'savage', label: '🔥 SAVAGE', desc: 'No mercy mode' },
];

export default function RoastEngine() {
  const [mode, setMode] = useState('solo');
  const [step, setStep] = useState('input');
  const [form, setForm] = useState({ name: '', traits: '', roastLevel: 'medium' });
  const [battleForm, setBattleForm] = useState({
    person1: { name: '', traits: '' },
    person2: { name: '', traits: '' },
  });
  const [result, setResult] = useState(null);
  const [battleData, setBattleData] = useState(null);
  const cardRef = useRef(null);

  const handleGenerate = async () => {
    if (!form.name.trim()) return;
    setStep('loading');
    try {
      const { data } = await api.post('/roast/generate', {
        name: form.name.trim(),
        traits: form.traits.trim(),
        roastLevel: form.roastLevel,
      });
      setResult(data.data);
      setStep('result');
      confetti({ particleCount: 100, spread: 70, colors: ['#FFE600', '#FF3D00', '#FF1744'] });
    } catch {
      setStep('input');
    }
  };

  const handleBattle = async () => {
    if (!battleForm.person1.name.trim() || !battleForm.person2.name.trim()) return;
    setStep('loading');
    try {
      const { data } = await api.post('/roast/battle', {
        person1: { name: battleForm.person1.name.trim(), traits: battleForm.person1.traits.trim() },
        person2: { name: battleForm.person2.name.trim(), traits: battleForm.person2.traits.trim() },
      });
      setBattleData(data.data);
      setStep('battle');
      confetti({ particleCount: 150, spread: 90, colors: ['#FFE600', '#FF3D00'] });
    } catch {
      setStep('input');
    }
  };

  const shareResult = async () => {
    const text = result?.shareText || 'I just got DESTROYED on Dhindhora! 🔥';
    if (navigator.share) {
      try { await navigator.share({ title: '🔥 I got roasted!', text, url: window.location.href }); } catch {}
    } else {
      navigator.clipboard.writeText(text + ' ' + window.location.href);
    }
  };

  const reset = () => { setStep('input'); setResult(null); setBattleData(null); };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* MODE TOGGLE */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '2rem' }}>
        {[{ id: 'solo', label: '🎯 SOLO ROAST' }, { id: 'battle', label: '⚔️ ROAST BATTLE' }].map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); reset(); }}
            style={{
              flex: 1, padding: '0.875rem', border: '3px solid var(--primary)',
              background: mode === m.id ? 'var(--primary)' : 'transparent',
              color: mode === m.id ? 'var(--black)' : 'var(--primary)',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem',
              letterSpacing: '0.1em', cursor: 'pointer',
              boxShadow: mode === m.id ? '4px 4px 0px var(--accent)' : 'none',
              transition: 'all 0.2s',
            }}
          >{m.label}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* SOLO INPUT */}
        {step === 'input' && mode === 'solo' && (
          <motion.div key="solo" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="brutal-card">
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }}
                style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🔥</motion.div>
              <h2 style={{ fontSize: '2.5rem', lineHeight: 1 }} className="zine-text">GET AI ROASTED</h2>
              <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Describe yourself. The AI will destroy you (lovingly).
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem', letterSpacing: '0.1em' }}>YOUR NAME *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Rahul Sharma" maxLength={60} className="brutal-input" />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem', letterSpacing: '0.1em' }}>ABOUT YOU (makes the roast personal)</label>
              <textarea value={form.traits} onChange={e => setForm(f => ({ ...f, traits: e.target.value }))}
                placeholder="e.g. CS student, chai addict, can't wake up before noon..."
                rows={3} maxLength={300} className="brutal-input" style={{ resize: 'none' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.1em' }}>ROAST INTENSITY</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {LEVELS.map(lv => (
                  <button key={lv.id} onClick={() => setForm(f => ({ ...f, roastLevel: lv.id }))}
                    className={`level-btn ${form.roastLevel === lv.id ? 'active' : ''}`}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{lv.label}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: 2 }}>{lv.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleGenerate} className="brutal-btn-danger brutal-btn" style={{ width: '100%' }}>
              🔥 ROAST ME NOW
            </motion.button>
          </motion.div>
        )}

        {/* BATTLE INPUT */}
        {step === 'input' && mode === 'battle' && (
          <motion.div key="battle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="brutal-card">
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>⚔️</div>
              <h2 style={{ fontSize: '2.5rem', lineHeight: 1 }} className="zine-text">ROAST BATTLE</h2>
              <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Two enter. AI decides who burns harder.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              {['person1', 'person2'].map((p, i) => (
                <div key={p} style={{ padding: '1rem', border: `2px solid ${i === 0 ? 'var(--primary)' : 'var(--accent)'}`, background: 'var(--gray-800)' }}>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', color: i === 0 ? 'var(--primary)' : 'var(--accent)', marginBottom: '0.75rem' }}>
                    FIGHTER {i + 1} {i === 0 ? '🥊' : '🥋'}
                  </p>
                  <input value={battleForm[p].name} onChange={e => setBattleForm(bf => ({ ...bf, [p]: { ...bf[p], name: e.target.value } }))}
                    placeholder="Name" maxLength={40} className="brutal-input" style={{ marginBottom: '0.5rem' }} />
                  <textarea value={battleForm[p].traits} onChange={e => setBattleForm(bf => ({ ...bf, [p]: { ...bf[p], traits: e.target.value } }))}
                    placeholder="Describe them..." rows={2} maxLength={150} className="brutal-input" style={{ resize: 'none' }} />
                </div>
              ))}
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleBattle} className="brutal-btn" style={{ width: '100%' }}>
              ⚔️ LET THE BATTLE BEGIN
            </motion.button>
          </motion.div>
        )}

        {/* LOADING */}
        {step === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="brutal-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1 }} style={{ fontSize: '5rem', display: 'inline-block', marginBottom: '1.5rem' }}>🔥</motion.div>
            <h2 style={{ fontSize: '2rem' }} className="zine-text fire-glow">CONSULTING THE ROAST ARCHIVES...</h2>
            <p style={{ color: 'var(--gray-400)', marginTop: '0.5rem', fontSize: '0.85rem' }}>Preparing your destruction</p>
          </motion.div>
        )}

        {/* SOLO RESULT */}
        {step === 'result' && result && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <div ref={cardRef} className="roast-result-card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '3rem' }}>{result.emoji}</span>
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', letterSpacing: '0.05em' }} className="zine-text">{result.verdict}</div>
                    <div style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>aka "{result.funnyNickname}"</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--gray-400)', fontSize: '0.65rem', letterSpacing: '0.15em' }}>ROAST SCORE</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3rem', color: 'var(--primary)', lineHeight: 1 }}>{result.roastScore}</div>
                </div>
              </div>

              <div className="roast-block roast-block-fire">
                <div style={{ color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.4rem' }}>🔥 THE ROAST</div>
                <p style={{ color: 'var(--white)', fontSize: '0.9rem', lineHeight: 1.7 }}>{result.roast}</p>
              </div>

              <div className="roast-block roast-block-praise">
                <div style={{ color: 'var(--success)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.4rem' }}>💚 THE PRAISE</div>
                <p style={{ color: 'var(--white)', fontSize: '0.9rem', lineHeight: 1.7 }}>{result.praise}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                {[{ label: 'SUPERPOWER', value: result.superpower, color: 'var(--primary)' },
                  { label: 'WEAKNESS', value: result.weakness, color: 'var(--accent)' }].map(s => (
                  <div key={s.label} className="stat-box">
                    <div style={{ color: 'var(--gray-400)', fontSize: '0.6rem', letterSpacing: '0.15em', marginBottom: '0.25rem' }}>{s.label}</div>
                    <div style={{ color: s.color, fontWeight: 600, fontSize: '0.8rem' }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', color: 'var(--gray-600)', fontSize: '0.7rem' }}>Made with 🔥 on Dhindhora</div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={shareResult}
                className="brutal-btn" style={{ flex: 1 }}>📤 SHARE ROAST</motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={reset}
                className="brutal-btn brutal-btn-outline" style={{ flex: 1 }}>🔄 ROAST AGAIN</motion.button>
            </div>
          </motion.div>
        )}

        {/* BATTLE RESULT */}
        {step === 'battle' && battleData && (
          <motion.div key="battle-result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="brutal-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ textAlign: 'center', fontSize: '2rem' }} className="zine-text">⚔️ BATTLE REPORT</h3>
            {(battleData.rounds || []).map((round, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }}
                style={{ border: '2px solid var(--gray-600)', padding: '1rem', background: 'var(--gray-800)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", color: 'var(--primary)', fontSize: '1rem' }}>ROUND {round.round}</span>
                  <span style={{ fontSize: '0.85rem' }}>{round.crowdReaction}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '0.75rem' }}>
                    <div style={{ color: 'var(--primary)', fontSize: '0.65rem', fontWeight: 700, marginBottom: '0.25rem' }}>FIGHTER 1</div>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', lineHeight: 1.5 }}>{round.person1Attack}</p>
                  </div>
                  <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '0.75rem' }}>
                    <div style={{ color: 'var(--accent)', fontSize: '0.65rem', fontWeight: 700, marginBottom: '0.25rem' }}>FIGHTER 2</div>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', lineHeight: 1.5 }}>{round.person2Attack}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            <div style={{ border: '3px solid var(--primary)', padding: '1.5rem', textAlign: 'center', boxShadow: '6px 6px 0px var(--accent)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem' }} className="zine-text">
                {battleData.overallWinner === 'tie' ? "IT'S A TIE!" : battleData.overallWinner === 'person1' ? `${battleForm.person1.name} WINS!` : `${battleForm.person2.name} WINS!`}
              </div>
              <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{battleData.finalVerdict}</p>
            </div>
            <button onClick={reset} className="brutal-btn brutal-btn-outline" style={{ width: '100%' }}>🔄 NEW BATTLE</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
