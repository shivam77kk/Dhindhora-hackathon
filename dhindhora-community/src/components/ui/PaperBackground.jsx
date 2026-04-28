import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

function NetworkNodes({ count = 50 }) {
  const groupRef = useRef();

  // Generate random positions for community nodes
  const nodes = useMemo(() => {
    const pts = [];
    for (let i = 0; i < count; i++) {
      pts.push(new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10
      ));
    }
    return pts;
  }, [count]);

  // Generate connecting lines between close nodes
  const lines = useMemo(() => {
    const linesArr = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const distance = nodes[i].distanceTo(nodes[j]);
        if (distance < 5) { // Only connect close nodes
          linesArr.push([nodes[i], nodes[j]]);
        }
      }
    }
    return linesArr;
  }, [nodes, count]);

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(lines.length * 6);
    let i = 0;
    lines.forEach(([start, end]) => {
      positions[i++] = start.x; positions[i++] = start.y; positions[i++] = start.z;
      positions[i++] = end.x;   positions[i++] = end.y;   positions[i++] = end.z;
    });
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [lines]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.05;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.02) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Nodes */}
      {nodes.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#06B6D4" transparent opacity={0.8} />
        </mesh>
      ))}

      {/* Connections */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#8b5cf6" transparent opacity={0.15} />
      </lineSegments>
    </group>
  );
}

export default function PaperBackground() {
  return (
    <div className="fixed inset-0 z-0 bg-[#050510] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <fog attach="fog" args={['#050510', 5, 25]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#6C63FF" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#06B6D4" />
        
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        <NetworkNodes count={80} />
      </Canvas>
    </div>
  );
}
