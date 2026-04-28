'use client';
import { useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollCamera() {
  const { camera } = useThree();

  useEffect(() => {
    
    
    const points = [
      new THREE.Vector3(0, 5, 10),    
      new THREE.Vector3(-8, 2, 5),    
      new THREE.Vector3(-10, -2, 0),  
      new THREE.Vector3(0, -5, -8),   
      new THREE.Vector3(10, 0, -5),   
      new THREE.Vector3(5, 5, 5)      
    ];
    
    
    const curve = new THREE.CatmullRomCurve3(points);
    curve.closed = false;

    
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5, 
        onUpdate: (self) => {
          const t = self.progress; 
          
          
          const camPos = curve.getPointAt(Math.min(t, 0.99));
          const camLookAt = curve.getPointAt(Math.min(t + 0.05, 1.0));
          
          
          const vel = self.getVelocity() / 3000;
          
          gsap.to(camera.position, {
            x: camPos.x,
            y: camPos.y,
            z: camPos.z,
            duration: 0.5,
            ease: "power2.out",
            overwrite: "auto"
          });

          
          const targetRot = new THREE.Euler().setFromQuaternion(
            new THREE.Quaternion().setFromRotationMatrix(
              new THREE.Matrix4().lookAt(camPos, camLookAt, new THREE.Vector3(0, 1, 0))
            )
          );

          gsap.to(camera.rotation, {
            
            z: Math.max(Math.min(vel, Math.PI/4), -Math.PI/4), 
            duration: 0.8,
            ease: "power2.out",
            overwrite: "auto"
          });
        }
      });
    });

    return () => ctx.revert();
  }, [camera]);

  useFrame((state, delta) => {
    
    camera.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.005;
  });

  return null;
}
