'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import toast from 'react-hot-toast';

// ── Emotion configs ──────────────────────────────────────────────────────────
const EMOTION_CFG = {
  happy:     { color: '#f59e0b', glow: '#fbbf24', emoji: '😄', scale: 1.05 },
  sad:       { color: '#60a5fa', glow: '#93c5fd', emoji: '😢', scale: 0.97 },
  angry:     { color: '#ef4444', glow: '#f97316', emoji: '😡', scale: 1.08 },
  surprised: { color: '#a855f7', glow: '#d946ef', emoji: '😮', scale: 1.1  },
  fearful:   { color: '#f97316', glow: '#fb923c', emoji: '😨', scale: 0.95 },
  disgusted: { color: '#10b981', glow: '#34d399', emoji: '🤢', scale: 0.98 },
  neutral:   { color: '#8b5cf6', glow: '#7c3aed', emoji: '😐', scale: 1.0  },
};

// ── 3D Avatar component (no external fonts needed) ───────────────────────────
function Avatar3D({ emotion, expressions }) {
  const groupRef     = useRef();
  const headRef      = useRef();
  const leftEyeRef   = useRef();
  const rightEyeRef  = useRef();
  const mouthRef     = useRef();
  const materialRef  = useRef();
  const targetColorRef = useRef(new THREE.Color('#8b5cf6'));
  const currentColorRef = useRef(new THREE.Color('#8b5cf6'));

  const cfg = EMOTION_CFG[emotion] || EMOTION_CFG.neutral;

  useEffect(() => {
    targetColorRef.current.set(cfg.color);
  }, [emotion, cfg.color]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Smooth color lerp
    currentColorRef.current.lerp(targetColorRef.current, 0.04);
    if (materialRef.current) {
      materialRef.current.color.copy(currentColorRef.current);
      materialRef.current.emissive.copy(currentColorRef.current).multiplyScalar(0.15);
    }

    // Idle head movement
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.5) * 0.08;
      headRef.current.rotation.x = Math.sin(t * 0.3) * 0.04;
      headRef.current.position.y = Math.sin(t * 0.9) * 0.04;
    }

    // Eye blink every ~4 seconds
    if (leftEyeRef.current && rightEyeRef.current) {
      const blinkCycle = Math.sin(t * 0.8);
      const blink = blinkCycle > 0.97 ? Math.max(0.05, 1 - (blinkCycle - 0.97) * 50) : 1;
      leftEyeRef.current.scale.y = blink;
      rightEyeRef.current.scale.y = blink;
    }

    // Mouth opens based on happy/surprised expression
    if (mouthRef.current && expressions) {
      const openAmount = (expressions.happy || 0) * 0.4 + (expressions.surprised || 0) * 0.6;
      mouthRef.current.scale.y = 0.3 + openAmount * 0.7;
      mouthRef.current.scale.x = 0.6 + openAmount * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Head */}
      <mesh ref={headRef} castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          ref={materialRef}
          color={cfg.color}
          roughness={0.3}
          metalness={0.2}
          emissive={cfg.color}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Left eye white */}
      <mesh ref={leftEyeRef} position={[-0.32, 0.22, 0.92]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="white" roughness={0.5} />
      </mesh>
      {/* Left pupil */}
      <mesh position={[-0.32, 0.22, 1.02]}>
        <sphereGeometry args={[0.065, 12, 12]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      {/* Left highlight */}
      <mesh position={[-0.295, 0.245, 1.075]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Right eye white */}
      <mesh ref={rightEyeRef} position={[0.32, 0.22, 0.92]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="white" roughness={0.5} />
      </mesh>
      {/* Right pupil */}
      <mesh position={[0.32, 0.22, 1.02]}>
        <sphereGeometry args={[0.065, 12, 12]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      {/* Right highlight */}
      <mesh position={[0.335, 0.245, 1.075]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Nose */}
      <mesh position={[0, -0.04, 1.0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color={cfg.color} roughness={0.5} emissive={cfg.color} emissiveIntensity={0.1} />
      </mesh>

      {/* Mouth */}
      <mesh ref={mouthRef} position={[0, -0.28, 0.93]}>
        <capsuleGeometry args={[0.07, 0.22, 8, 16]} />
        <meshStandardMaterial
          color={emotion === 'happy' ? '#fbbf24' : emotion === 'angry' ? '#ef4444' : '#ec4899'}
          roughness={0.4}
        />
      </mesh>

      {/* Eyebrows — raised for surprised/happy */}
      {[-0.32, 0.32].map((x, i) => (
        <mesh
          key={i}
          position={[x, 0.45 + ((['happy', 'surprised'].includes(emotion)) ? 0.12 : 0), 0.92]}
          rotation={[0, 0, i === 0 ? 0.2 : -0.2]}
        >
          <capsuleGeometry args={[0.025, 0.2, 4, 8]} />
          <meshStandardMaterial color={cfg.color} emissive={cfg.color} emissiveIntensity={0.3} />
        </mesh>
      ))}

      {/* Emotion label (using Html from drei — no font needed) */}
      <Html position={[0, 1.6, 0]} center distanceFactor={4}>
        <div style={{
          background: 'rgba(5,5,16,0.85)',
          backdropFilter: 'blur(8px)',
          border: `1px solid ${cfg.glow}50`,
          borderRadius: 20,
          padding: '4px 12px',
          color: 'white',
          fontSize: 12,
          fontFamily: 'sans-serif',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          userSelect: 'none',
        }}>
          {cfg.emoji} {emotion}
        </div>
      </Html>

      {/* Glow point light that changes with emotion */}
      <pointLight color={cfg.glow} intensity={0.8} distance={4} position={[0, 0, 2]} />
    </group>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function AvatarMirror() {
  const videoRef    = useRef(null);
  const intervalRef = useRef(null);
  const streamRef   = useRef(null);
  const [active, setActive]         = useState(false);
  const [emotion, setEmotion]       = useState('neutral');
  const [expressions, setExpressions] = useState({});
  const [faceFound, setFaceFound]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [startError, setStartError] = useState('');

  const EMOJI_MAP = { happy:'😄', sad:'😢', angry:'😡', surprised:'😮', neutral:'😐', fearful:'😨', disgusted:'🤢' };

  const startMirror = async () => {
    setStartError('');
    setLoading(true);
    try {
      // 1. Load face-api.js dynamically (same pattern as existing EmotionDetector.js)
      const faceapi = await import('face-api.js');
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
      ]);

      // 2. Camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await new Promise((res) => { videoRef.current.onloadedmetadata = res; });
      videoRef.current.play();
      setActive(true);

      // 3. Detection loop every 400ms
      intervalRef.current = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;
        try {
          const det = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
            .withFaceExpressions();

          if (det?.expressions) {
            setFaceFound(true);
            const exp = det.expressions;
            setExpressions({ ...exp }); // plain object copy
            const dominant = Object.entries(exp).sort((a, b) => b[1] - a[1])[0][0];
            setEmotion(dominant);
          } else {
            setFaceFound(false);
          }
        } catch { /* detection can fail on blurry frames — ignore */ }
      }, 400);

      toast.success('🧬 Avatar Mirror ready! Make expressions to see your avatar react!', { duration: 4000 });
    } catch (err) {
      const msg = err.name === 'NotAllowedError'
        ? 'Camera permission denied. Allow camera and retry.'
        : `Error: ${err.message}`;
      setStartError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const stopMirror = () => {
    clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
    setFaceFound(false);
    setEmotion('neutral');
    setExpressions({});
  };

  useEffect(() => () => stopMirror(), []);

  const cfg = EMOTION_CFG[emotion] || EMOTION_CFG.neutral;

  return (
    <div className="w-full flex flex-col lg:flex-row gap-5">
      {/* Left: camera feed */}
      <div className="flex-1 space-y-3">
        <div
          className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/50"
          style={{ aspectRatio: '4/3' }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)', opacity: active ? 0.7 : 0 }}
          />

          {/* Face status */}
          {active && (
            <div className="absolute top-3 left-3 flex items-center gap-2 glass rounded-full px-3 py-1">
              <span className={`w-2 h-2 rounded-full ${faceFound ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-xs text-white/70">{faceFound ? 'Face detected' : 'Looking for face...'}</span>
            </div>
          )}

          {/* Emotion badge */}
          <AnimatePresence mode="wait">
            {active && faceFound && (
              <motion.div
                key={emotion}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 glass rounded-full px-5 py-2 flex items-center gap-2"
                style={{ borderColor: cfg.glow + '60', border: `1px solid ${cfg.glow}60` }}
              >
                <span className="text-2xl">{cfg.emoji}</span>
                <span className="text-white font-semibold capitalize">{emotion}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Start screen */}
          {!active && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#050510]/80">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-7xl">
                🧬
              </motion.div>
              <p className="text-white font-bold text-lg text-center px-4">Avatar Mirror</p>
              <p className="text-white/50 text-sm text-center px-6">
                Your face becomes a 3D avatar. Every expression you make, it mirrors.
              </p>
              {startError && <p className="text-red-400 text-xs px-4 text-center">{startError}</p>}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={startMirror}
                disabled={loading}
                className="px-7 py-3 rounded-full bg-gradient-to-r from-brand-500 to-cyan-500 text-white font-bold shadow-lg shadow-brand-500/30 disabled:opacity-50"
              >
                {loading ? '⏳ Loading AI...' : '🧬 Activate Mirror'}
              </motion.button>
            </div>
          )}
        </div>

        {/* Expression bars */}
        {active && Object.keys(expressions).length > 0 && (
          <div className="glass rounded-xl p-4 border border-white/10 space-y-2">
            <p className="text-xs text-white/40 font-bold uppercase tracking-wide">Expression Readout</p>
            {Object.entries(expressions)
              .sort(([,a],[,b]) => b - a)
              .slice(0, 5)
              .map(([exp, val]) => (
                <div key={exp} className="flex items-center gap-3">
                  <span className="text-sm w-16 text-white/55 capitalize">{exp}</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-neon-pink"
                      animate={{ width: `${Math.round(val * 100)}%` }}
                      transition={{ duration: 0.25 }}
                    />
                  </div>
                  <span className="text-xs text-white/35 w-8 text-right">{Math.round(val * 100)}%</span>
                </div>
              ))}
          </div>
        )}

        {active && (
          <button onClick={stopMirror} className="w-full py-2.5 rounded-xl glass border border-red-500/30 text-red-400 hover:text-red-300 text-sm font-semibold transition-colors">
            ⏹ Stop Mirror
          </button>
        )}
      </div>

      {/* Right: Three.js avatar */}
      <div className="flex-1 space-y-3">
        <div
          className="rounded-2xl overflow-hidden border border-white/10"
          style={{ aspectRatio: '4/3', background: '#050510' }}
        >
          <Canvas
            camera={{ position: [0, 0.1, 3.8], fov: 40 }}
            gl={{ antialias: true, alpha: true }}
            style={{ background: 'transparent' }}
          >
            <color attach="background" args={['#050510']} />
            <ambientLight intensity={0.4} />
            <pointLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
            <pointLight position={[-5, -5, -5]} intensity={0.3} color="#7c3aed" />
            <Avatar3D emotion={emotion} expressions={expressions} />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate={!active}
              autoRotateSpeed={0.8}
              minPolarAngle={Math.PI * 0.3}
              maxPolarAngle={Math.PI * 0.7}
            />
          </Canvas>
        </div>
        <div className="text-center">
          <p className="text-white/40 text-xs">
            {active ? '🎭 Your 3D avatar is mirroring your expressions' : 'Activate to see your avatar come alive'}
          </p>
          {active && (
            <p className="text-brand-400 text-xs mt-1 font-semibold">
              Try smiling, raising eyebrows, or looking surprised! {cfg.emoji}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
