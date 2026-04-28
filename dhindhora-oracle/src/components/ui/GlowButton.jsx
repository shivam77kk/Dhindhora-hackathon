'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function GlowButton({ children, href, onClick, size = 'md', type = 'button', disabled = false, className = '' }) {
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
    xl: 'px-10 py-5 text-lg',
  };

  const baseClass = `inline-flex items-center justify-center gap-2 font-semibold rounded-xl bg-gradient-to-r from-brand-500 to-neon-pink text-white transition-all hover:shadow-[0_0_30px_rgba(108,99,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href}>
        <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={baseClass}>
          {children}
        </motion.span>
      </Link>
    );
  }

  return (
    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClick} type={type} disabled={disabled} className={baseClass}>
      {children}
    </motion.button>
  );
}
