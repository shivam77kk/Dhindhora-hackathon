import { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmotionWorldUpgraded from '@/components/ai/EmotionWorldUpgraded';

const CosmicBackground = lazy(() => import('@/components/three/CosmicBackground'));

/* ═══════════════════════════════════════════════════════
   SCROLL PROGRESS
   ═══════════════════════════════════════════════════════ */
function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const h = () => {
      const top = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? top / height : 0);
    };
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  return <div className="sc-scroll-progress" style={{ width: `${progress * 100}%` }} />;
}

/* ═══════════════════════════════════════════════════════
   CUSTOM CURSOR (desktop only)
   ═══════════════════════════════════════════════════════ */
function CursorGlow() {
  const ref = useRef(null);
  useEffect(() => {
    if (window.matchMedia('(max-width: 768px)').matches) return;
    const c = ref.current;
    if (!c) return;
    const move = (e) => {
      c.style.left = e.clientX - 10 + 'px';
      c.style.top = e.clientY - 10 + 'px';
    };
    const grow = () => {
      c.style.transform = 'scale(2)';
      c.style.borderColor = '#A3F7FF';
      c.style.boxShadow = '0 0 16px rgba(163,247,255,0.5)';
    };
    const shrink = () => {
      c.style.transform = 'scale(1)';
      c.style.borderColor = '#00A8CC';
      c.style.boxShadow = 'none';
    };
    window.addEventListener('mousemove', move);
    document.querySelectorAll('a, button, .sc-msg, .sc-input').forEach((el) => {
      el.addEventListener('mouseenter', grow);
      el.addEventListener('mouseleave', shrink);
    });
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return <div ref={ref} className="custom-cursor hidden md:block" />;
}

/* ═══════════════════════════════════════════════════════
   RIPPLE EFFECT ON CLICK
   ═══════════════════════════════════════════════════════ */
function useRipple() {
  const createRipple = useCallback((e) => {
    const ripple = document.createElement('div');
    ripple.className = 'sc-ripple';
    const size = 30;
    ripple.style.width = size + 'px';
    ripple.style.height = size + 'px';
    ripple.style.left = e.clientX - size / 2 + 'px';
    ripple.style.top = e.clientY - size / 2 + 'px';
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }, []);

  useEffect(() => {
    document.addEventListener('click', createRipple);
    return () => document.removeEventListener('click', createRipple);
  }, [createRipple]);
}

/* ═══════════════════════════════════════════════════════
   AI TYPING INDICATOR
   ═══════════════════════════════════════════════════════ */
function TypingIndicator() {
  return (
    <div className="sc-msg sc-msg-ai" style={{ padding: '14px 20px' }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -6, 0], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--sc-primary)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN STORY ALCHEMIST PAGE
   ═══════════════════════════════════════════════════════ */
export default function StoryControlPage() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content:
        'In the depths of the neon nebula, your emotions dictate the reality. How do you feel about the horizon ahead?',
      emoji: '✨',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useRipple();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const appendStory = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content:
            'The world shifts as your words take form. The shadows recede, leaving only the stardust of your intentions.',
          emoji: '🌌',
        },
      ]);
    }, 1800);
  };

  return (
    <div className="story-universe">
      {/* Three.js Background */}
      <Suspense fallback={null}>
        <CosmicBackground />
      </Suspense>

      <ScrollProgress />
      <CursorGlow />

      {/* ── Header ── */}
      <header className="sc-header">
        <motion.div
          className="sc-title-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: 'spring' }}
        >
          <h1 className="sc-title">Story Alchemist</h1>
        </motion.div>
        <motion.p
          className="sc-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Your expressions and voice control the world theme and narrative flow.
          Step into an AI-generated emotional universe where your words shape
          reality.
        </motion.p>
      </header>

      {/* ── Main Content ── */}
      <div className="sc-main">
        {/* ── Left: Emotion Panel ── */}
        <motion.div
          className="sc-emotion-panel"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="sc-emotion-world">
            <EmotionWorldUpgraded
              webreelId="story-collab-x"
              broadcastEmotion
            />
          </div>

          {/* System Status */}
          <motion.div
            className="sc-status-card"
            style={{ marginTop: 16 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="sc-status-label">System Status</div>
            <div className="sc-status-row">
              <span className="sc-status-name">Audio Reactive Engine</span>
              <span className="sc-status-active">● ACTIVE</span>
            </div>
            <div className="sc-status-row">
              <span className="sc-status-name">Emotion Mapping</span>
              <span className="sc-status-synced">● SYNCED</span>
            </div>
            <div className="sc-status-row">
              <span className="sc-status-name">Narrative AI</span>
              <span className="sc-status-active">● LIVE</span>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Right: Narrative Panel ── */}
        <motion.div
          className="sc-narrative-panel"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="sc-narrative-container">
            {/* Header */}
            <div className="sc-narrative-header">
              <span className="sc-narrative-title">
                ✦ Hyper-Interactive Narrative
              </span>
              <span className="sc-narrative-badge">Gemini 1.5 Flash</span>
            </div>

            {/* Messages */}
            <div className="sc-messages">
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.92, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      type: 'spring',
                      stiffness: 120,
                      damping: 14,
                    }}
                    className={`sc-msg ${
                      m.role === 'user' ? 'sc-msg-user' : 'sc-msg-ai'
                    }`}
                  >
                    {m.role === 'ai' && m.emoji && (
                      <motion.div
                        className="sc-msg-emoji"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.2,
                          type: 'spring',
                          stiffness: 200,
                        }}
                      >
                        {m.emoji}
                      </motion.div>
                    )}
                    <p className="sc-msg-text">{m.content}</p>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ alignSelf: 'flex-start' }}
                >
                  <TypingIndicator />
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={appendStory} className="sc-input-area">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Shape your reality... type your story path"
                className="sc-input"
              />
              <motion.button
                type="submit"
                className="sc-send-btn"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
              >
                ➜
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
