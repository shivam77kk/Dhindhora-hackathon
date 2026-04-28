'use client';
import { useState, useEffect } from 'react';

let scriptsLoaded = false;
let scriptsLoading = false;
const callbacks = [];

async function loadScripts() {
  if (scriptsLoaded) return;
  if (scriptsLoading) {
    return new Promise((resolve) => callbacks.push(resolve));
  }
  scriptsLoading = true;

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.body.appendChild(script);
    });
  };

  try {
    await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
    await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
    await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
    
    scriptsLoaded = true;
    scriptsLoading = false;
    callbacks.forEach((cb) => cb());
  } catch (err) {
    scriptsLoading = false;
    throw err;
  }
}

export function useMediaPipe() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    loadScripts()
      .then(() => {
        // Double check they are on window
        if (window.Hands && window.Camera) {
          setReady(true);
        } else {
          // Poll a few times just in case
          let checks = 0;
          const interval = setInterval(() => {
            if (window.Hands && window.Camera) {
              clearInterval(interval);
              setReady(true);
            } else if (checks > 10) {
              clearInterval(interval);
              setError("MediaPipe scripts loaded but globals not found");
            }
            checks++;
          }, 200);
        }
      })
      .catch((err) => {
        console.error('MediaPipe load error:', err);
        setError(err.message);
      });
  }, []);

  return { ready, error };
}
