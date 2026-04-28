'use client';
import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Splat, OrbitControls, Environment } from '@react-three/drei';

function SplatScene({ url }) {
  const splatRef = useRef();
  
  useFrame((state) => {
    if (splatRef.current) {
      
      splatRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
      splatRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Environment preset="city" />
      <Float>
        <Splat ref={splatRef} src={url || '/splats/demo.splat'} scale={1.5} position={[0, 0, 0]} />
      </Float>
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} maxPolarAngle={Math.PI / 2 + 0.1} minPolarAngle={Math.PI / 3} />
    </>
  );
}


function Float({ children }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
    }
  });
  return <group ref={ref}>{children}</group>;
}

export default function GaussianSplatViewer({ splatUrl }) {
  return (
    <div className="w-full h-full relative group">
      <Canvas camera={{ position: [0, 1, 5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <SplatScene url={splatUrl} />
      </Canvas>
      <div className="absolute bottom-4 left-4 glass px-3 py-1 text-xs text-white/50 rounded-full flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
        3D Gaussian Splat
      </div>
    </div>
  );
}
