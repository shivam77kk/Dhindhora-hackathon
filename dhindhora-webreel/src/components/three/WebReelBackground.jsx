import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function FloatingShapes() {
  const group = useRef();
  
  // Create random floating geometry data
  const shapes = useMemo(() => {
    const items = [];
    const colors = ['#6366F1', '#F59E0B', '#A78BFA', '#34D399']; // Indigo, Amber, Purple, Emerald
    
    for (let i = 0; i < 20; i++) {
      items.push({
        position: [
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 20 - 10
        ],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
        scale: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 0.2 + 0.1,
        type: Math.floor(Math.random() * 3) // 0: sphere, 1: torus, 2: icosahedron
      });
    }
    return items;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    group.current.children.forEach((mesh, i) => {
      const s = shapes[i];
      mesh.position.y += Math.sin(t * s.speed + i) * 0.01;
      mesh.rotation.x += s.speed * 0.01;
      mesh.rotation.y += s.speed * 0.01;
    });
  });

  return (
    <group ref={group}>
      {shapes.map((s, i) => {
        let geometry;
        if (s.type === 0) geometry = <sphereGeometry args={[1, 32, 32]} />;
        else if (s.type === 1) geometry = <torusGeometry args={[1, 0.4, 16, 32]} />;
        else geometry = <icosahedronGeometry args={[1, 0]} />;

        return (
          <mesh
            key={i}
            position={s.position}
            rotation={s.rotation}
            scale={s.scale}
          >
            {geometry}
            <meshPhysicalMaterial 
              color={s.color} 
              transparent 
              opacity={0.15} 
              roughness={0.2}
              transmission={0.9}
              thickness={0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function WebReelBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#F9FAFB]">
      <Canvas camera={{ position: [0, 0, 20], fov: 50 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#6366F1" />
        <FloatingShapes />
      </Canvas>
    </div>
  );
}
