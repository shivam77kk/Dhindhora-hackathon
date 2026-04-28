import { useEffect, useState, useRef, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';

const ParticleField = lazy(() => import('@/components/ui/ParticleField'));

/* ═══════════════════════════════════════════════════════
   ANIMATED COUNTER COMPONENT
   ═══════════════════════════════════════════════════════ */
function AnimatedNumber({ value, duration = 1800 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setDisplay(Math.floor(eased * value));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{display.toLocaleString()}</span>;
}

/* ═══════════════════════════════════════════════════════
   SCROLL PROGRESS BAR
   ═══════════════════════════════════════════════════════ */
function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? scrollTop / docHeight : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="scroll-progress-bar"
      style={{ width: `${progress * 100}%` }}
    />
  );
}

/* ═══════════════════════════════════════════════════════
   CUSTOM CURSOR (desktop only)
   ═══════════════════════════════════════════════════════ */
function CursorGlow() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    const move = (e) => {
      cursor.style.left = e.clientX - 10 + 'px';
      cursor.style.top = e.clientY - 10 + 'px';
    };

    const grow = () => {
      cursor.style.transform = 'scale(2)';
      cursor.style.borderColor = '#FFD700';
      cursor.style.boxShadow = '0 0 16px rgba(255,215,0,0.4)';
    };
    const shrink = () => {
      cursor.style.transform = 'scale(1)';
      cursor.style.borderColor = '#F59E0B';
      cursor.style.boxShadow = 'none';
    };

    window.addEventListener('mousemove', move);
    document.querySelectorAll('a, button, .lb-row').forEach(el => {
      el.addEventListener('mouseenter', grow);
      el.addEventListener('mouseleave', shrink);
    });
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return <div ref={cursorRef} className="custom-cursor hidden md:block" />;
}

/* ═══════════════════════════════════════════════════════
   PODIUM CARD COMPONENT
   ═══════════════════════════════════════════════════════ */
function PodiumCard({ entry, rank, delay }) {
  const name = entry.user?.name || 'Anonymous';
  const username = entry.user?.username || 'user';
  const avatar = entry.user?.avatar;
  const initial = name?.[0]?.toUpperCase() || '?';

  return (
    <motion.div
      className={`podium-card rank-${rank}`}
      initial={{ opacity: 0, y: 50, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay,
        duration: 0.7,
        type: 'spring',
        stiffness: 80,
        damping: 14,
      }}
    >
      <div className="podium-avatar-wrap">
        {rank === 1 && <div className="podium-crown">👑</div>}
        <div className="podium-glow-ring" />
        <div className="podium-avatar">
          {avatar ? <img src={avatar} alt={name} /> : initial}
        </div>
        <div className="podium-rank-badge">{rank}</div>
      </div>
      <div className="podium-name">{name}</div>
      <div className="podium-username">@{username}</div>
      <div className="podium-score">
        <AnimatedNumber value={entry.totalScore || 0} duration={2000 + rank * 200} />
      </div>
      <div className="podium-pillar" />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   LEADERBOARD ROW COMPONENT
   ═══════════════════════════════════════════════════════ */
function LeaderboardRow({ entry, rank, index, isCurrentUser }) {
  const name = entry.user?.name || 'Anonymous';
  const username = entry.user?.username || 'user';
  const level = entry.user?.level || 1;
  const avatar = entry.user?.avatar;
  const initial = name?.[0]?.toUpperCase() || '?';

  return (
    <motion.div
      className={`lb-row ${isCurrentUser ? 'is-current-user' : ''}`}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: 0.8 + index * 0.06,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <div className="lb-rank">{rank}</div>
      <div className="lb-row-avatar">
        {avatar ? <img src={avatar} alt={name} /> : initial}
      </div>
      <div className="lb-row-info">
        <div className="lb-row-name">{name}</div>
        <div className="lb-row-meta">
          <span>@{username}</span>
          <span className="dot" />
          <span>Lvl {level}</span>
          {entry.webreelsPublished > 0 && (
            <>
              <span className="dot" />
              <span>{entry.webreelsPublished} reels</span>
            </>
          )}
        </div>
      </div>
      <div className="lb-row-score">
        <div className="lb-row-score-value">
          <AnimatedNumber value={entry.totalScore || 0} duration={1600 + index * 100} />
        </div>
        <div className="lb-row-score-label">points</div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN LEADERBOARD PAGE
   ═══════════════════════════════════════════════════════ */
export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/leaderboard')
      .then((res) => {
        const data = res.data.data || res.data || [];
        setEntries(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Leaderboard fetch error:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const totalScore = entries.reduce((sum, e) => sum + (e.totalScore || 0), 0);
  const totalReels = entries.reduce((sum, e) => sum + (e.webreelsPublished || 0), 0);

  // Reorder top3 for podium display: [2nd, 1st, 3rd]
  const podiumOrder = top3.length >= 3
    ? [top3[1], top3[0], top3[2]]
    : top3;
  const podiumRanks = top3.length >= 3 ? [2, 1, 3] : top3.map((_, i) => i + 1);

  return (
    <div className="leaderboard-bg">
      <Suspense fallback={null}>
        <ParticleField />
      </Suspense>
      <ScrollProgress />
      <CursorGlow />

      {/* ── Header ── */}
      <header className="lb-header">
        <motion.div
          className="lb-header-icon"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
        >
          🏆
        </motion.div>
        <motion.h1
          className="lb-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          Leaderboard
        </motion.h1>
        <motion.p
          className="lb-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Top creators in the Dhindhora galaxy
        </motion.p>
      </header>

      {/* ── Content ── */}
      {loading ? (
        <div className="lb-loading">
          <div className="lb-loading-ring" />
          <div className="lb-loading-text">Loading leaderboard...</div>
        </div>
      ) : entries.length === 0 ? (
        <motion.div
          className="lb-empty"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="lb-empty-icon">🏆</div>
          <div className="lb-empty-title">Leaderboard is empty</div>
          <div className="lb-empty-desc">
            Be the first to climb the ranks! Create weboreels and earn points to
            appear on the leaderboard.
          </div>
        </motion.div>
      ) : (
        <>
          {/* ── Stats Bar ── */}
          <motion.div
            className="lb-stats-bar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="lb-stat">
              <div className="lb-stat-value">
                <AnimatedNumber value={entries.length} duration={1200} />
              </div>
              <div className="lb-stat-label">Creators</div>
            </div>
            <div className="lb-stat">
              <div className="lb-stat-value">
                <AnimatedNumber value={totalScore} duration={1600} />
              </div>
              <div className="lb-stat-label">Total Points</div>
            </div>
            <div className="lb-stat">
              <div className="lb-stat-value">
                <AnimatedNumber value={totalReels} duration={1400} />
              </div>
              <div className="lb-stat-label">Reels Created</div>
            </div>
          </motion.div>

          <div className="lb-divider" />

          {/* ── Podium ── */}
          {top3.length > 0 && (
            <div className="podium-section">
              {podiumOrder.map((entry, i) => (
                <PodiumCard
                  key={entry._id || i}
                  entry={entry}
                  rank={podiumRanks[i]}
                  delay={0.3 + i * 0.15}
                />
              ))}
            </div>
          )}

          {/* ── Remaining List ── */}
          {rest.length > 0 && (
            <div className="lb-list-section">
              <div className="lb-list-header">
                <span className="lb-list-title">Rankings</span>
                <span className="lb-list-count">{rest.length} more creators</span>
              </div>
              {rest.map((entry, i) => (
                <LeaderboardRow
                  key={entry._id || i + 3}
                  entry={entry}
                  rank={i + 4}
                  index={i}
                  isCurrentUser={user && entry.user?._id === user._id}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
