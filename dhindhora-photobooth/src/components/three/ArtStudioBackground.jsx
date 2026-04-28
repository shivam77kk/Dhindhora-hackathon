import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── Watercolor Spots ─────────────────────────────────────────────────────────
function WatercolorSpots({ count = 25 }) {
  const meshRefs = useRef([]);

  const spots = useMemo(() => {
    const arr = [];
    const palette = [
      '#FF2E93', // Pink
      '#00F0FF', // Cyan
      '#FF8A00', // Orange
      '#8A2BE2', // Purple
      '#FFF500', // Yellow
    ];

    for (let i = 0; i < count; i++) {
      const scale = Math.random() * 8 + 4;
      arr.push({
        position: [
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 30,
          -10 - Math.random() * 5
        ],
        scale: [scale, scale + (Math.random() - 0.5) * 2, 1],
        rotation: Math.random() * Math.PI,
        color: new THREE.Color(palette[Math.floor(Math.random() * palette.length)]),
        opacity: Math.random() * 0.15 + 0.05,
        pulseSpeed: Math.random() * 0.5 + 0.1,
        phase: Math.random() * Math.PI * 2
      });
    }
    return arr;
  }, [count]);

  const spotTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Create an irregular brush dab/watercolor spot shape
    const cx = 128, cy = 128;
    ctx.beginPath();
    for (let i = 0; i <= Math.PI * 2; i += 0.1) {
      const r = 100 + Math.random() * 20 - 10;
      const x = cx + Math.cos(i) * r;
      const y = cy + Math.sin(i) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    
    // Fill with soft radial gradient
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.6)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.fillStyle = grad;
    ctx.filter = 'blur(8px)';
    ctx.fill();
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const s = spots[i];
      mesh.material.opacity = s.opacity + Math.sin(t * s.pulseSpeed + s.phase) * 0.05;
      const scaleMult = 1 + Math.sin(t * s.pulseSpeed * 0.5 + s.phase) * 0.05;
      mesh.scale.set(s.scale[0] * scaleMult, s.scale[1] * scaleMult, 1);
    });
  });

  return (
    <group>
      {spots.map((spot, i) => (
        <mesh 
          key={i} 
          ref={(el) => (meshRefs.current[i] = el)} 
          position={spot.position} 
          rotation={[0, 0, spot.rotation]}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial 
            map={spotTexture} 
            color={spot.color} 
            transparent 
            blending={THREE.MultiplyBlending} 
            depthWrite={false} 
          />
        </mesh>
      ))}
    </group>
  );
}

// ── Floating Dust Particles ───────────────────────────────────────────────────
function DustParticles({ count = 200 }) {
  const pointsRef = useRef();

  const { positions, speeds, phases, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
      speeds[i] = Math.random() * 0.2 + 0.05;
      phases[i] = Math.random() * Math.PI * 2;
      sizes[i]  = Math.random() * 1.5 + 0.5;
    }
    return { positions, speeds, phases, sizes };
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    const pos = pointsRef.current.geometry.attributes.position.array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const sp = speeds[i];
      const ph = phases[i];
      
      // Gentle floating motion
      pos[i3]     += Math.sin(t * sp + ph) * 0.003;
      pos[i3 + 1] += Math.cos(t * sp * 0.8 + ph) * 0.003 + (sp * 0.005);
      
      if (pos[i3 + 1] > 15) {
        pos[i3 + 1] = -15;
        pos[i3] = (Math.random() - 0.5) * 30;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        color="#a0a0a0"
        size={0.1}
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function ArtStudioBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: '#faf8f5' }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <WatercolorSpots count={30} />
        <DustParticles count={250} />
      </Canvas>
      {/* Subtle paper texture overlay */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        opacity: 0.05,
        mixBlendMode: 'multiply'
      }} />
    </div>
  );
}
