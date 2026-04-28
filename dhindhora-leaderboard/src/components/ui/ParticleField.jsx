import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── Floating star-like particles ─── */
function StarDust({ count = 200 }) {
  const mesh = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    return pos;
  }, [count]);

  const speeds = useMemo(() => {
    const s = [];
    for (let i = 0; i < count; i++) {
      s.push({
        y: (Math.random() * 0.4 + 0.1) * (Math.random() > 0.5 ? 1 : -1),
        x: (Math.random() * 0.2 + 0.05) * (Math.random() > 0.5 ? 1 : -1),
        phase: Math.random() * Math.PI * 2,
      });
    }
    return s;
  }, [count]);

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.15, 'rgba(255, 220, 100, 0.8)');
    gradient.addColorStop(0.4, 'rgba(245, 158, 11, 0.3)');
    gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.elapsedTime;
    const arr = mesh.current.geometry.attributes.position.array;

    for (let i = 0; i < count; i++) {
      const s = speeds[i];
      arr[i * 3] += Math.sin(time * 0.3 + s.phase) * 0.004 + s.x * 0.002;
      arr[i * 3 + 1] += s.y * 0.004;

      // Wrap
      if (arr[i * 3 + 1] > 30) arr[i * 3 + 1] = -30;
      if (arr[i * 3 + 1] < -30) arr[i * 3 + 1] = 30;
      if (arr[i * 3] > 20) arr[i * 3] = -20;
      if (arr[i * 3] < -20) arr[i * 3] = 20;
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={0.35}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.7}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#F59E0B"
      />
    </points>
  );
}

/* ─── Warm glowing orbs ─── */
function WarmOrbs({ count = 8 }) {
  const mesh = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 2] = -6 - Math.random() * 4;
    }
    return pos;
  }, [count]);

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
    gradient.addColorStop(0.2, 'rgba(249, 115, 22, 0.3)');
    gradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.1)');
    gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.elapsedTime;
    const arr = mesh.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      arr[i * 3] += Math.sin(time * 0.08 + i * 2.5) * 0.008;
      arr[i * 3 + 1] += Math.cos(time * 0.06 + i * 1.8) * 0.006;
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={2.5}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.25}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#FFD700"
      />
    </points>
  );
}

/* ─── Gentle camera breathing ─── */
function CameraBreathing() {
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    state.camera.position.x = Math.sin(t * 0.04) * 0.4;
    state.camera.position.y = Math.cos(t * 0.035) * 0.3;
  });
  return null;
}

/* ─── Main Export ─── */
export default function ParticleField() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 12], fov: 55 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'low-power',
        }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <StarDust count={180} />
        <WarmOrbs count={8} />
        <CameraBreathing />
      </Canvas>
    </div>
  );
}
