import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════════════════
   1. MYSTICAL RINGS — Rotating golden wireframe torus rings
   ═══════════════════════════════════════════════════════════════════════════ */
function MysticalRing({ radius, tube, color, opacity, speedX, speedY, speedZ, initialRotation }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.x = initialRotation[0] + t * speedX;
    ref.current.rotation.y = initialRotation[1] + t * speedY;
    ref.current.rotation.z = initialRotation[2] + t * speedZ;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, tube, 48, 120]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={opacity} />
    </mesh>
  );
}

function MysticalRings() {
  return (
    <group>
      {/* Large outer ring — slow, majestic */}
      <MysticalRing
        radius={5.5} tube={0.015} color="#c4a35a" opacity={0.12}
        speedX={0.04} speedY={0.02} speedZ={0.01}
        initialRotation={[0.8, 0, 0.3]}
      />
      {/* Medium ring — opposite tilt */}
      <MysticalRing
        radius={4.0} tube={0.012} color="#b07a4b" opacity={0.1}
        speedX={-0.03} speedY={0.05} speedZ={-0.02}
        initialRotation={[-0.4, 1.2, 0.7]}
      />
      {/* Inner ring — faster, smaller */}
      <MysticalRing
        radius={2.8} tube={0.01} color="#d4b978" opacity={0.15}
        speedX={0.06} speedY={-0.03} speedZ={0.04}
        initialRotation={[1.5, 0.5, -0.2]}
      />
      {/* Tiny accent ring */}
      <MysticalRing
        radius={1.5} tube={0.008} color="#c4a35a" opacity={0.08}
        speedX={-0.08} speedY={0.06} speedZ={-0.03}
        initialRotation={[0.3, -0.8, 1.0]}
      />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. FLOATING CRYSTALS — Small wireframe octahedrons & icosahedrons
   ═══════════════════════════════════════════════════════════════════════════ */
function FloatingCrystal({ position, geometry, color, opacity, rotSpeed, floatSpeed, floatAmp }) {
  const ref = useRef();
  const startY = position[1];
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.x += rotSpeed[0];
    ref.current.rotation.y += rotSpeed[1];
    ref.current.rotation.z += rotSpeed[2];
    ref.current.position.y = startY + Math.sin(t * floatSpeed) * floatAmp;
    ref.current.position.x = position[0] + Math.sin(t * floatSpeed * 0.7 + 1.5) * (floatAmp * 0.4);
  });

  return (
    <mesh ref={ref} position={position} scale={0.3}>
      {geometry === 'octa' && <octahedronGeometry args={[1, 0]} />}
      {geometry === 'ico' && <icosahedronGeometry args={[0.8, 0]} />}
      {geometry === 'tetra' && <tetrahedronGeometry args={[1, 0]} />}
      <meshBasicMaterial color={color} wireframe transparent opacity={opacity} />
    </mesh>
  );
}

function FloatingCrystals() {
  const crystals = useMemo(() => [
    { pos: [-5, 3, -2], geo: 'octa',  col: '#c4a35a', op: 0.2, rs: [0.003, 0.005, 0.002], fs: 0.4, fa: 1.2 },
    { pos: [5.5, -2, -1], geo: 'ico',   col: '#b07a4b', op: 0.18, rs: [-0.004, 0.003, 0.006], fs: 0.35, fa: 0.9 },
    { pos: [-4, -3.5, -3], geo: 'tetra', col: '#d4b978', op: 0.15, rs: [0.005, -0.002, 0.004], fs: 0.5, fa: 1.0 },
    { pos: [3, 4, -2], geo: 'octa',  col: '#a0694a', op: 0.14, rs: [-0.003, 0.006, -0.002], fs: 0.3, fa: 1.4 },
    { pos: [-2, 5, -1], geo: 'ico',   col: '#c4a35a', op: 0.16, rs: [0.004, 0.002, -0.005], fs: 0.45, fa: 0.8 },
    { pos: [6, 1, -3], geo: 'tetra', col: '#b07a4b', op: 0.12, rs: [-0.005, 0.004, 0.003], fs: 0.38, fa: 1.1 },
    { pos: [-6, 0, -2], geo: 'octa',  col: '#d4b978', op: 0.13, rs: [0.002, -0.005, 0.003], fs: 0.42, fa: 0.7 },
  ], []);

  return (
    <group>
      {crystals.map((c, i) => (
        <FloatingCrystal
          key={i}
          position={c.pos}
          geometry={c.geo}
          color={c.col}
          opacity={c.op}
          rotSpeed={c.rs}
          floatSpeed={c.fs}
          floatAmp={c.fa}
        />
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. GOLDEN DUST PARTICLES — Enhanced with glow sprites & more motion
   ═══════════════════════════════════════════════════════════════════════════ */
function GoldenDust({ count = 180 }) {
  const pointsRef = useRef();

  const { positions, speeds, phases, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds    = new Float32Array(count);
    const phases    = new Float32Array(count);
    const sizes     = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      speeds[i]  = Math.random() * 0.3 + 0.1;
      phases[i]  = Math.random() * Math.PI * 2;
      sizes[i]   = Math.random() * 3 + 0.5;
    }
    return { positions, speeds, phases, sizes };
  }, [count]);

  const sprite = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(220,190,130,1)');
    g.addColorStop(0.2, 'rgba(196,163,90,0.7)');
    g.addColorStop(0.6, 'rgba(176,122,75,0.2)');
    g.addColorStop(1, 'rgba(176,122,75,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    const pos = pointsRef.current.geometry.attributes.position.array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const sp = speeds[i];
      const ph = phases[i];

      /* Spiral drift */
      pos[i3]     += Math.sin(t * sp * 0.8 + ph) * 0.004;
      pos[i3 + 1] += sp * 0.005;
      pos[i3 + 2] += Math.cos(t * sp * 0.5 + ph) * 0.002;

      if (pos[i3 + 1] > 11) {
        pos[i3 + 1] = -11;
        pos[i3] = (Math.random() - 0.5) * 22;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        size={0.14}
        color="#dcbe82"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. CONSTELLATION LINES — Connected star patterns
   ═══════════════════════════════════════════════════════════════════════════ */
function ConstellationWeb() {
  const ref = useRef();

  const { positions, basePositions } = useMemo(() => {
    const nodes = [];
    const nodeCount = 30;
    for (let i = 0; i < nodeCount; i++) {
      nodes.push([
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 5 - 2,
      ]);
    }

    /* Connect nearby nodes */
    const lines = [];
    const maxDist = 4.5;
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = nodes[i][0] - nodes[j][0];
        const dy = nodes[i][1] - nodes[j][1];
        const dz = nodes[i][2] - nodes[j][2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < maxDist) {
          lines.push(...nodes[i], ...nodes[j]);
        }
      }
    }

    const positions = new Float32Array(lines);
    const basePositions = new Float32Array(lines);
    return { positions, basePositions };
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const pos = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      pos[i]     = basePositions[i]     + Math.sin(t * 0.15 + i * 0.3) * 0.12;
      pos[i + 1] = basePositions[i + 1] + Math.cos(t * 0.12 + i * 0.2) * 0.12;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <lineSegments ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#c4a35a" transparent opacity={0.06} />
    </lineSegments>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. NEBULA ORBS — Large soft glowing spheres that pulse
   ═══════════════════════════════════════════════════════════════════════════ */
function NebulaOrb({ position, color, scale, speed }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.scale.setScalar(scale + Math.sin(t * speed) * 0.15);
    ref.current.material.opacity = 0.04 + Math.sin(t * speed * 0.5) * 0.02;
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.04} side={THREE.BackSide} />
    </mesh>
  );
}

function NebulaOrbs() {
  return (
    <group>
      <NebulaOrb position={[-4, 2, -4]}  color="#c4a35a" scale={2.5} speed={0.3} />
      <NebulaOrb position={[5, -3, -3]}  color="#7a3b3b" scale={2.0} speed={0.25} />
      <NebulaOrb position={[0, 5, -5]}   color="#4a7a72" scale={3.0} speed={0.2} />
      <NebulaOrb position={[-3, -4, -4]} color="#b07a4b" scale={1.8} speed={0.35} />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCENE EXPORT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function VintageBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <MysticalRings />
        <FloatingCrystals />
        <GoldenDust count={180} />
        <ConstellationWeb />
        <NebulaOrbs />
      </Canvas>
    </div>
  );
}
