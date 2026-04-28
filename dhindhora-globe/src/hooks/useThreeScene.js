'use client';
import { useEffect, useRef } from 'react';

export default function useThreeScene() {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  return { mountRef, rendererRef };
}
