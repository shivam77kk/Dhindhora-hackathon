'use client';
import { useEffect, useRef } from 'react';

export default function CursorEffect() {
  const cursorRef = useRef(null);
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    const move = (e) => {
      cursor.style.left = e.clientX - 10 + 'px';
      cursor.style.top = e.clientY - 10 + 'px';
    };
    const grow = () => { cursor.style.transform = 'scale(2)'; cursor.style.borderColor = '#EC4899'; };
    const shrink = () => { cursor.style.transform = 'scale(1)'; cursor.style.borderColor = '#6C63FF'; };
    window.addEventListener('mousemove', move);
    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', grow);
      el.addEventListener('mouseleave', shrink);
    });
    return () => { window.removeEventListener('mousemove', move); };
  }, []);
  return <div ref={cursorRef} className="custom-cursor hidden md:block" />;
}
