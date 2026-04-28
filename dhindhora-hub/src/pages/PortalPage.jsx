import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';

const EMOJI_MAP = {
  roast: '🔥', fortune: '🔮', game: '🎮', globe: '🌍',
  photobooth: '📸', aircanvas: '✋', story: '📖',
  webreel: '🌌', prediction: '🎰', startup: '💡',
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 60, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function PortalPage() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  const [activity, setActivity] = useState([]);
  const gridRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get('/v1/features').catch(() => ({ data: { data: [] } })),
      api.get('/v1/activity').catch(() => ({ data: { data: [] } })),
    ]).then(([featRes, actRes]) => {
      setFeatures(featRes.data?.data || []);
      setActivity((actRes.data?.data || []).slice(0, 8));
      setLoading(false);
    });
  }, []);

  const handleCardClick = (feature) => {
    if (feature.frontendUrl) {
      window.open(feature.frontendUrl, '_blank');
    }
  };

  return (
    <div className="noise-overlay" style={{ position: 'relative', zIndex: 10, minHeight: '100vh' }}>
      {/* ═══ HERO ═══ */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '2rem', position: 'relative',
      }}>
        <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="portal-ring" style={{ width: 500, height: 500, opacity: 0.15 }} />
          <div className="portal-ring-reverse" style={{ width: 700, height: 700, position: 'absolute', opacity: 0.08 }} />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'relative', zIndex: 2 }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 1rem', borderRadius: 999, marginBottom: '1.5rem',
              background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.25)',
              fontSize: '0.8rem', color: 'var(--primary-light)',
            }}
          >
            🏆 Team Black Clovers — Dhindhora Hackathon
          </motion.div>

          <h1 style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', lineHeight: 0.95, marginBottom: '1.5rem' }}>
            <motion.span
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ display: 'block', color: 'var(--text-primary)' }}
            >
              THE
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="gradient-text"
              style={{ display: 'block' }}
            >
              MULTIVERSE
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.6em' }}
            >
              PORTAL
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={{ color: 'var(--text-secondary)', maxWidth: 550, margin: '0 auto 2rem', lineHeight: 1.7, fontSize: '1.05rem' }}
          >
            Each portal leads to a unique AI-powered experience.
            <br />
            <span style={{ color: 'var(--primary-light)' }}>{features.length} dimensions</span> await your exploration.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <a
              href="#portals"
              style={{
                display: 'inline-block', padding: '1rem 2.5rem', borderRadius: 16,
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                color: '#fff', fontWeight: 700, fontSize: '1.05rem',
                fontFamily: "'Syne', sans-serif", letterSpacing: '-0.01em',
                boxShadow: '0 0 40px rgba(139, 92, 246, 0.4)',
                transition: 'transform 0.3s, box-shadow 0.3s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 60px rgba(139, 92, 246, 0.6)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(139, 92, 246, 0.4)'; }}
            >
              Enter the Portals ⚡
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          style={{ position: 'absolute', bottom: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
        >
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Scroll to explore
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              width: 24, height: 40, border: '1px solid var(--border)', borderRadius: 12,
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 4,
            }}
          >
            <div style={{ width: 4, height: 10, background: 'var(--primary)', borderRadius: 4 }} />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ FEATURE PORTALS ═══ */}
      <section id="portals" style={{ padding: '6rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', marginBottom: '1rem' }}>
            <span className="gradient-text">Choose Your</span>{' '}
            <span style={{ color: 'var(--text-primary)' }}>Dimension</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
            Each portal is a standalone immersive experience — different design, different energy, same universe.
          </p>
        </motion.div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass" style={{ borderRadius: 24, height: 240, animation: 'pulse-glow 2s infinite', opacity: 0.3 }} />
            ))}
          </div>
        ) : (
          <motion.div
            ref={gridRef}
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.featureId}
                variants={cardVariant}
                className="feature-card"
                onClick={() => handleCardClick(feature)}
                onMouseEnter={() => setHoveredId(feature.featureId)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ cursor: feature.frontendUrl ? 'none' : 'default' }}
              >
                <div className="card-inner" style={{ position: 'relative' }}>
                  {/* Glow accent */}
                  <div style={{
                    position: 'absolute', top: -40, right: -40, width: 120, height: 120,
                    borderRadius: '50%', background: feature.color, opacity: hoveredId === feature.featureId ? 0.15 : 0.05,
                    filter: 'blur(40px)', transition: 'opacity 0.4s',
                  }} />

                  {/* Icon */}
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: `linear-gradient(135deg, ${feature.color}22, ${feature.color}44)`,
                    border: `1px solid ${feature.color}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', transition: 'transform 0.3s',
                    transform: hoveredId === feature.featureId ? 'scale(1.15) rotate(5deg)' : 'scale(1)',
                  }}>
                    {EMOJI_MAP[feature.featureId] || feature.icon}
                  </div>

                  {/* Content */}
                  <div>
                    <h3 style={{
                      fontFamily: "'Syne', sans-serif", fontSize: '1.25rem',
                      fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)',
                    }}>
                      {feature.name}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                      {feature.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div style={{
                    marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    paddingTop: '0.75rem', borderTop: '1px solid var(--border)',
                  }}>
                    <span style={{
                      fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: 8,
                      background: `${feature.color}15`, color: feature.color, fontWeight: 600,
                    }}>
                      {feature.theme}
                    </span>
                    <motion.span
                      animate={{ x: hoveredId === feature.featureId ? 4 : 0 }}
                      style={{ color: feature.color, fontSize: '1.2rem' }}
                    >
                      →
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* ═══ ACTIVITY FEED ═══ */}
      {activity.length > 0 && (
        <section style={{ padding: '4rem 2rem 6rem', maxWidth: 800, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '2rem' }}
          >
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              <span className="gradient-text">Live Feed</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>What's happening across the multiverse</p>
          </motion.div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activity.map((event, i) => (
              <motion.div
                key={event._id || i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="glass"
                style={{
                  padding: '0.75rem 1rem', borderRadius: 12,
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  fontSize: '0.8rem',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{EMOJI_MAP[event.featureId] || '✨'}</span>
                <span style={{ color: 'var(--text-secondary)', flex: 1 }}>
                  {event.message || `Activity in ${event.featureId}`}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                  {new Date(event.createdAt).toLocaleTimeString()}
                </span>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ═══ FOOTER ═══ */}
      <footer style={{
        padding: '3rem 2rem', borderTop: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '0.9rem', fontFamily: "'Syne', sans-serif",
          }}>
            D
          </div>
          <span className="gradient-text" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.1rem' }}>
            DHINDHORA
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          Team Black Clovers — Dhindhora Hackathon 2025
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
          {features.length} Dimensions • Powered by Gemini AI • Built with ❤️
        </p>
      </footer>
    </div>
  );
}
