import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Line, Sphere } from '@react-three/drei';

function BauhausNetwork() {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 50; i++) {
      pts.push(new THREE.Vector3(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10
      ));
    }
    return pts;
  }, []);

  const lines = useMemo(() => {
    const lns = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        if (points[i].distanceTo(points[j]) < 5) {
          lns.push([points[i], points[j]]);
        }
      }
    }
    return lns;
  }, [points]);

  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.05;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.02) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {points.map((p, i) => (
        <Sphere key={`p-${i}`} args={[0.08, 8, 8]} position={p}>
          <meshBasicMaterial color={i % 3 === 0 ? "#E63946" : i % 3 === 1 ? "#457B9D" : "#F4A261"} />
        </Sphere>
      ))}
      {lines.map((line, i) => (
        <Line
          key={`l-${i}`}
          points={line}
          color="white"
          lineWidth={1}
          opacity={0.1}
          transparent
        />
      ))}
    </group>
  );
}

function GridBackground() {
  return (
    <group position={[0, 0, -10]}>
      <gridHelper args={[100, 100, '#ffffff', '#ffffff']} material-opacity={0.05} material-transparent rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );
}

function BauhausShapes() {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      groupRef.current.children.forEach((child, i) => {
        child.rotation.z = t * (0.1 + i * 0.02);
        child.position.y += Math.sin(t + i) * 0.005;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Circle */}
      <mesh position={[-8, 5, -5]}>
        <ringGeometry args={[2, 2.5, 32]} />
        <meshBasicMaterial color="#E63946" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Square */}
      <mesh position={[8, -4, -4]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[4, 4]} />
        <meshBasicMaterial color="#457B9D" transparent opacity={0.6} side={THREE.DoubleSide} wireframe />
      </mesh>

      {/* Triangle */}
      <mesh position={[-6, -6, -6]} rotation={[0, 0, Math.PI / 6]}>
        <circleGeometry args={[2.5, 3]} />
        <meshBasicMaterial color="#F4A261" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export default function ParticleBackground() {
  return (
    <div className="fixed inset-0 z-0" style={{ background: '#050505' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }} gl={{ antialias: true, alpha: true }}>
        <fog attach="fog" args={['#050505', 10, 30]} />
        <ambientLight intensity={0.5} />
        <GridBackground />
        <BauhausShapes />
        <BauhausNetwork />
      </Canvas>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_100%)] pointer-events-none" />
    </div>
  );
}
