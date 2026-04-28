import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="loading-screen"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="loading-orb" />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', marginTop: '2rem', letterSpacing: '-0.02em' }}
          >
            <span className="gradient-text">DHINDHORA</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.6 }}
            style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}
          >
            Entering the Multiverse...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
