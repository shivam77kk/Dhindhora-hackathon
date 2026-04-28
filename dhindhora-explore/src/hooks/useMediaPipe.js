'use client';
import { useState, useEffect } from 'react';


let handsModule = null;
let cameraModule = null;
let modulesLoaded = false;
let modulesLoading = false;
const callbacks = [];

async function loadModules() {
  if (modulesLoaded) return;
  if (modulesLoading) {
    return new Promise((resolve) => callbacks.push(resolve));
  }
  modulesLoading = true;

  try {
    const [hands, camera] = await Promise.all([
      import('@mediapipe/hands'),
      import('@mediapipe/camera_utils'),
    ]);

    handsModule = hands;
    cameraModule = camera;

    
    window.Hands = hands.Hands;
    window.Camera = camera.Camera;

    modulesLoaded = true;
    modulesLoading = false;
    callbacks.forEach((cb) => cb());
  } catch (err) {
    modulesLoading = false;
    throw err;
  }
}

export function useMediaPipe() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    loadModules()
      .then(() => setReady(true))
      .catch((err) => {
        console.error('MediaPipe load error:', err);
        setError(err.message);
      });
  }, []);

  return { ready, error };
}
