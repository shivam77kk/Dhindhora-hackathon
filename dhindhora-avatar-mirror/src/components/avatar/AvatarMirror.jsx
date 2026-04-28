'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import toast from 'react-hot-toast';


const EMOTION_CFG = {
  happy:     { color: '#fde047', glow: '#facc15', emoji: '😄', scale: 1.05 },
  sad:       { color: '#93c5fd', glow: '#60a5fa', emoji: '😢', scale: 0.97 },
  angry:     { color: '#fca5a5', glow: '#ef4444', emoji: '😡', scale: 1.08 },
  surprised: { color: '#d8b4fe', glow: '#c084fc', emoji: '😮', scale: 1.1  },
  fearful:   { color: '#fdba74', glow: '#f97316', emoji: '😨', scale: 0.95 },
  disgusted: { color: '#86efac', glow: '#4ade80', emoji: '🤢', scale: 0.98 },
  neutral:   { color: '#c4b5fd', glow: '#a78bfa', emoji: '😐', scale: 1.0  },
};


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

    
    currentColorRef.current.lerp(targetColorRef.current, 0.04);
    if (materialRef.current) {
      materialRef.current.color.copy(currentColorRef.current);
      materialRef.current.emissive.copy(currentColorRef.current).multiplyScalar(0.15);
    }

    
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.5) * 0.08;
      headRef.current.rotation.x = Math.sin(t * 0.3) * 0.04;
      headRef.current.position.y = Math.sin(t * 0.9) * 0.04;
    }

    
    if (leftEyeRef.current && rightEyeRef.current) {
      const blinkCycle = Math.sin(t * 0.8);
      const blink = blinkCycle > 0.97 ? Math.max(0.05, 1 - (blinkCycle - 0.97) * 50) : 1;
      leftEyeRef.current.scale.y = blink;
      rightEyeRef.current.scale.y = blink;
    }

    
    if (mouthRef.current && expressions) {
      const openAmount = (expressions.happy || 0) * 0.4 + (expressions.surprised || 0) * 0.6;
      mouthRef.current.scale.y = 0.3 + openAmount * 0.7;
      mouthRef.current.scale.x = 0.6 + openAmount * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {}
      <mesh ref={headRef} castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshToonMaterial
          ref={materialRef}
          color={cfg.color}
          emissive={cfg.color}
          emissiveIntensity={0.15}
        />
      </mesh>

      {}
      <mesh ref={leftEyeRef} position={[-0.32, 0.22, 0.92]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshToonMaterial color="white" />
      </mesh>
      {}
      <mesh position={[-0.32, 0.22, 1.02]}>
        <sphereGeometry args={[0.065, 12, 12]} />
        <meshToonMaterial color="#334155" />
      </mesh>
      {}
      <mesh position={[-0.295, 0.245, 1.075]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color="white" />
      </mesh>

      {}
      <mesh ref={rightEyeRef} position={[0.32, 0.22, 0.92]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshToonMaterial color="white" />
      </mesh>
      {}
      <mesh position={[0.32, 0.22, 1.02]}>
        <sphereGeometry args={[0.065, 12, 12]} />
        <meshToonMaterial color="#334155" />
      </mesh>
      {}
      <mesh position={[0.335, 0.245, 1.075]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color="white" />
      </mesh>

      {}
      <mesh position={[0, -0.04, 1.0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshToonMaterial color={cfg.glow} emissive={cfg.glow} emissiveIntensity={0.2} />
      </mesh>

      {}
      <mesh ref={mouthRef} position={[0, -0.28, 0.93]}>
        <capsuleGeometry args={[0.07, 0.22, 8, 16]} />
        <meshToonMaterial
          color={emotion === 'happy' ? '#fb7185' : emotion === 'angry' ? '#ef4444' : '#f472b6'}
        />
      </mesh>

      {}
      {[-0.32, 0.32].map((x, i) => (
        <mesh
          key={i}
          position={[x, 0.45 + ((['happy', 'surprised'].includes(emotion)) ? 0.12 : 0), 0.92]}
          rotation={[0, 0, i === 0 ? 0.2 : -0.2]}
        >
          <capsuleGeometry args={[0.025, 0.2, 4, 8]} />
          <meshToonMaterial color="#334155" />
        </mesh>
      ))}

      {}
      <Html position={[0, 1.7, 0]} center distanceFactor={4}>
        <div style={{
          background: 'white',
          border: '3px solid #334155',
          borderRadius: 16,
          padding: '6px 16px',
          color: '#334155',
          fontSize: 16,
          fontWeight: 'bold',
          fontFamily: "'Fredoka', sans-serif",
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          userSelect: 'none',
          boxShadow: '4px 4px 0px #334155',
          position: 'relative'
        }}>
          {cfg.emoji} <span style={{ textTransform: 'capitalize' }}>{emotion}</span>
          <div style={{
            position: 'absolute',
            bottom: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #334155',
          }}/>
          <div style={{
            position: 'absolute',
            bottom: -4,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '5px solid white',
            zIndex: 1
          }}/>
        </div>
      </Html>

      {}
      <pointLight color={cfg.glow} intensity={0.8} distance={6} position={[2, 2, 3]} />
      <directionalLight color="white" intensity={0.5} position={[-2, 2, 2]} />
    </group>
  );
}


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
  const [modelMissing, setModelMissing] = useState(false);

  const EMOJI_MAP = { happy:'😄', sad:'😢', angry:'😡', surprised:'😮', neutral:'😐', fearful:'😨', disgusted:'🤢' };

  const startMirror = async () => {
    setStartError('');
    setLoading(true);
    try {
      
      const faceapi = await import('face-api.js');
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        ]);
      } catch (err) {
        console.error('FaceAPI Models missing:', err);
        setModelMissing(true);
        throw new Error('AI models not found in /public/models. Please ensure models are installed.');
      }

      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await new Promise((res) => { videoRef.current.onloadedmetadata = res; });
      videoRef.current.play();
      setActive(true);

      
      intervalRef.current = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;
        try {
          const det = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
            .withFaceExpressions();

          if (det?.expressions) {
            setFaceFound(true);
            const exp = det.expressions;
            setExpressions({ ...exp }); 
            const dominant = Object.entries(exp).sort((a, b) => b[1] - a[1])[0][0];
            setEmotion(dominant);
          } else {
            setFaceFound(false);
          }
        } catch {  }
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
      {}
      <div className="flex-1 space-y-4">
        <div
          className="relative rounded-[20px] overflow-hidden border-4 border-[#1e1b4b] bg-[#fffbfa] shadow-[8px_8px_0_#1e1b4b] transition-transform"
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

          {/* Face detected status */}
          {active && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-yellow-100 border-4 border-[#1e1b4b] rounded-full px-4 py-2 shadow-[2px_2px_0_#1e1b4b]">
              <span className={`w-4 h-4 rounded-full border-4 border-[#1e1b4b] ${faceFound ? 'bg-[#34d399] animate-bounce' : 'bg-[#f87171]'}`} />
              <span className="text-sm font-black text-[#1e1b4b] uppercase tracking-wide">{faceFound ? 'Face Found! 📸' : 'Where are you? 👀'}</span>
            </div>
          )}

          {/* Emotion Badge */}
          <AnimatePresence mode="wait">
            {active && faceFound && (
              <motion.div
                key={emotion}
                initial={{ scale: 0, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0, y: 20 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full px-8 py-4 flex items-center gap-4 border-4 border-[#1e1b4b] shadow-[6px_6px_0_#1e1b4b]"
              >
                <span className="text-5xl drop-shadow-[2px_2px_0_#1e1b4b]">{cfg.emoji}</span>
                <span className="text-[#1e1b4b] font-black uppercase tracking-wider text-xl">{emotion}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Start Overlay */}
          {!active && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-indigo-500/95 via-purple-500/95 to-pink-500/95 backdrop-blur-md z-10">
              <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-8xl drop-shadow-[4px_4px_0_#1e1b4b]">
                🎭
              </motion.div>
              <p className="text-white font-black text-4xl text-center px-4 drop-shadow-[4px_4px_0_#1e1b4b]">Magic Mirror</p>
              <p className="text-yellow-200 font-bold text-center text-lg px-6 max-w-sm drop-shadow-[2px_2px_0_#1e1b4b]">
                Watch your 3D buddy mimic your every move! Let's get silly! 😜
              </p>
              {modelMissing && (
                <div className="bg-[#fee2e2] border-4 border-[#ef4444] rounded-2xl p-4 mx-6 mb-2 shadow-[4px_4px_0_#1e1b4b]">
                  <p className="text-[#ef4444] font-black text-center">
                    ⚠️ Oops! Magic models are missing.
                  </p>
                </div>
              )}
              {startError && <p className="text-[#ef4444] font-bold text-sm px-4 text-center bg-white border-4 border-[#1e1b4b] shadow-[4px_4px_0_#1e1b4b] rounded-xl p-3">{startError}</p>}
              <motion.button
                whileHover={modelMissing ? {} : { scale: 1.1, rotate: -3 }}
                whileTap={modelMissing ? {} : { scale: 0.9 }}
                onClick={startMirror}
                disabled={loading || modelMissing}
                className="mt-4 px-10 py-5 cartoon-button text-2xl flex items-center gap-3 disabled:opacity-50 disabled:grayscale"
              >
                {loading ? '🪄 Casting...' : modelMissing ? '💤 Asleep' : '✨ Start Magic'}
              </motion.button>
            </div>
          )}
        </div>

        {active && Object.keys(expressions).length > 0 && (
          <div className="bg-[#fffbfa] rounded-[20px] p-5 border-4 border-[#1e1b4b] shadow-[6px_6px_0_#1e1b4b] space-y-3 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 text-6xl opacity-20 rotate-12">📊</div>
            <p className="text-sm text-[#1e1b4b] font-black uppercase tracking-wider border-b-4 border-[#f1f5f9] pb-2 relative z-10">Mood Scanner</p>
            {Object.entries(expressions)
              .sort(([,a],[,b]) => b - a)
              .slice(0, 5)
              .map(([exp, val]) => (
                <div key={exp} className="flex items-center gap-3 relative z-10">
                  <span className="text-sm w-16 text-[#1e1b4b] font-bold capitalize drop-shadow-[1px_1px_0_white]">{exp}</span>
                  <div className="flex-1 h-4 bg-white rounded-full overflow-hidden border-2 border-[#1e1b4b] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
                    <motion.div
                      className="h-full rounded-r-full bg-gradient-to-r from-pink-400 to-yellow-400 border-r-2 border-[#1e1b4b]"
                      animate={{ width: `${Math.round(val * 100)}%` }}
                      transition={{ duration: 0.25 }}
                    />
                  </div>
                  <span className="text-sm text-[#1e1b4b] font-black w-8 text-right">{Math.round(val * 100)}%</span>
                </div>
              ))}
          </div>
        )}

        {active && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={stopMirror} 
            className="w-full py-4 rounded-full bg-gradient-to-r from-red-400 to-pink-500 border-4 border-[#1e1b4b] shadow-[6px_6px_0_#1e1b4b] text-white text-xl font-black transition-all hover:shadow-[4px_4px_0_#1e1b4b] hover:-translate-y-1 uppercase tracking-wide"
          >
            ⏹ Stop Magic
          </motion.button>
        )}
      </div>

      {}
      <div className="flex-1 space-y-4">
        <div
          className="rounded-[20px] overflow-hidden border-4 border-[#1e1b4b] shadow-[8px_8px_0_#1e1b4b] bg-white relative"
          style={{ aspectRatio: '4/3' }}
        >
          {/* Decorative background grid for the canvas */}
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#c084fc] to-[#f472b6]">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#ffffff44 3px, transparent 3px)', backgroundSize: '30px 30px' }}></div>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: 'linear' }} className="absolute -top-20 -left-20 w-64 h-64 bg-yellow-300 rounded-full mix-blend-overlay opacity-60 blur-3xl"></motion.div>
            <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 25, ease: 'linear' }} className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-300 rounded-full mix-blend-overlay opacity-60 blur-3xl"></motion.div>
          </div>
          
          <div className="relative z-10 w-full h-full">
            <Canvas
              camera={{ position: [0, 0.1, 3.8], fov: 40 }}
              gl={{ antialias: true, alpha: true }}
            >
              <ambientLight intensity={0.8} />
              <pointLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
              <pointLight position={[-5, -5, -5]} intensity={0.7} color="#a78bfa" />
              <Avatar3D emotion={emotion} expressions={expressions} />
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate={!active}
                autoRotateSpeed={2.5}
                minPolarAngle={Math.PI * 0.3}
                maxPolarAngle={Math.PI * 0.7}
              />
            </Canvas>
          </div>
        </div>
        <div className="text-center bg-gradient-to-r from-yellow-100 to-pink-100 border-4 border-[#1e1b4b] rounded-xl p-4 shadow-[4px_4px_0_#1e1b4b]">
          <p className="text-[#1e1b4b] font-black text-sm drop-shadow-[1px_1px_0_white]">
            {active ? '🎭 Your 3D avatar is mirroring your expressions!' : 'Activate to see your avatar come alive!'}
          </p>
          {active && (
            <p className="text-pink-600 text-sm mt-1 font-black animate-pulse">
              Try smiling, raising eyebrows, or looking surprised! {cfg.emoji}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
