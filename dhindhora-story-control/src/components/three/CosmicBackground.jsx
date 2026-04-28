import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── Nebula dust particles ─── */
function NebulaDust({ count = 220 }) {
  const mesh = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12 - 3;
    }
    return pos;
  }, [count]);

  const speeds = useMemo(() => {
    return Array.from({ length: count }, () => ({
      y: (Math.random() * 0.3 + 0.08) * (Math.random() > 0.5 ? 1 : -1),
      x: (Math.random() * 0.15 + 0.03) * (Math.random() > 0.5 ? 1 : -1),
      phase: Math.random() * Math.PI * 2,
    }));
  }, [count]);

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(163, 247, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(0, 168, 204, 0.6)');
    gradient.addColorStop(0.5, 'rgba(0, 126, 167, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 126, 167, 0)');
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
      arr[i * 3] += Math.sin(time * 0.25 + s.phase) * 0.003 + s.x * 0.002;
      arr[i * 3 + 1] += s.y * 0.003;

      if (arr[i * 3 + 1] > 25) arr[i * 3 + 1] = -25;
      if (arr[i * 3 + 1] < -25) arr[i * 3 + 1] = 25;
      if (arr[i * 3] > 18) arr[i * 3] = -18;
      if (arr[i * 3] < -18) arr[i * 3] = 18;
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
        size={0.3}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.65}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#00A8CC"
      />
    </points>
  );
}

/* ─── Deep space glow orbs ─── */
function CosmicOrbs({ count = 6 }) {
  const mesh = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = -6 - Math.random() * 5;
    }
    return pos;
  }, [count]);

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(163, 247, 255, 0.5)');
    gradient.addColorStop(0.25, 'rgba(0, 168, 204, 0.25)');
    gradient.addColorStop(0.5, 'rgba(0, 126, 167, 0.08)');
    gradient.addColorStop(1, 'rgba(0, 126, 167, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.elapsedTime;
    const arr = mesh.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      arr[i * 3] += Math.sin(time * 0.06 + i * 2) * 0.006;
      arr[i * 3 + 1] += Math.cos(time * 0.05 + i * 1.5) * 0.005;
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
        size={2.8}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.2}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#A3F7FF"
      />
    </points>
  );
}

/* ─── Connecting lines between nearby particles ─── */
function ConnectionLines({ count = 60 }) {
  const lineRef = useRef();
  const pointsData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 30,
      y: (Math.random() - 0.5) * 40,
      z: (Math.random() - 0.5) * 10 - 3,
      vx: (Math.random() - 0.5) * 0.01,
      vy: (Math.random() - 0.5) * 0.01,
    }));
  }, [count]);

  useFrame((state) => {
    if (!lineRef.current) return;
    const time = state.clock.elapsedTime;
    const positions = [];

    pointsData.forEach((p) => {
      p.x += p.vx + Math.sin(time * 0.1) * 0.002;
      p.y += p.vy + Math.cos(time * 0.08) * 0.002;
      if (p.x > 15 || p.x < -15) p.vx *= -1;
      if (p.y > 20 || p.y < -20) p.vy *= -1;
    });

    // Draw lines between nearby points
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = pointsData[i].x - pointsData[j].x;
        const dy = pointsData[i].y - pointsData[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 6) {
          positions.push(
            pointsData[i].x, pointsData[i].y, pointsData[i].z,
            pointsData[j].x, pointsData[j].y, pointsData[j].z
          );
        }
      }
    }

    const geo = lineRef.current.geometry;
    geo.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geo.computeBoundingSphere();
  });

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial
        color="#007EA7"
        transparent
        opacity={0.08}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
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
export default function CosmicBackground() {
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
        <NebulaDust count={200} />
        <CosmicOrbs count={6} />
        <ConnectionLines count={50} />
        <CameraBreathing />
      </Canvas>
    </div>
  );
}
