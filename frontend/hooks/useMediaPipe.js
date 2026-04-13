'use client';
import { useState, useEffect, useRef } from 'react';

const MEDIAPIPE_SCRIPTS = [
  'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1675466862/camera_utils.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3.1675466124/drawing_utils.js',
];

let scriptsLoaded = false;
let scriptsLoading = false;
const callbacks = [];

function loadAllScripts() {
  if (scriptsLoaded) return Promise.resolve();
  if (scriptsLoading) {
    return new Promise((resolve) => callbacks.push(resolve));
  }
  scriptsLoading = true;

  return new Promise((resolve, reject) => {
    let loaded = 0;

    MEDIAPIPE_SCRIPTS.forEach((src) => {
      
      if (document.querySelector(`script[src="${src}"]`)) {
        loaded++;
        if (loaded === MEDIAPIPE_SCRIPTS.length) {
          scriptsLoaded = true;
          resolve();
          callbacks.forEach((cb) => cb());
        }
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.async = false; 
      script.onload = () => {
        loaded++;
        if (loaded === MEDIAPIPE_SCRIPTS.length) {
          scriptsLoaded = true;
          scriptsLoading = false;
          resolve();
          callbacks.forEach((cb) => cb());
        }
      };
      script.onerror = (e) => {
        scriptsLoading = false;
        reject(new Error(`Failed to load MediaPipe script: ${src}`));
      };
      document.head.appendChild(script);
    });
  });
}

export function useMediaPipe() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    loadAllScripts()
      .then(() => setReady(true))
      .catch((err) => {
        console.error('MediaPipe load error:', err);
        setError(err.message);
      });
  }, []);

  return { ready, error };
}
