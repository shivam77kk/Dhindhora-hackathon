'use client';
import { motion, useScroll } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div className="fixed top-0 left-0 right-0 h-[2px] z-[100] origin-left bg-gradient-to-r from-brand-500 via-neon-pink to-neon-cyan" style={{ scaleX: scrollYProgress }} />
  );
}
