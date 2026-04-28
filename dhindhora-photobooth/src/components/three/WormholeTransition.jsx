'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function WormholeTransition() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.05);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); 
    mountRef.current.appendChild(renderer.domElement);

    
    const points = [];
    for (let i = 0; i < 5; i += 0.1) {
      points.push(new THREE.Vector3(
        Math.sin(i * Math.PI) * 2,
        Math.cos(i * Math.PI) * 2,
        -i * 20
      ));
    }
    const path = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(path, 100, 3, 20, false);
    
    
    const material = new THREE.MeshBasicMaterial({
      color: '#6C63FF',
      wireframe: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const tube = new THREE.Mesh(geometry, material);
    scene.add(tube);

    
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 2000;
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      pPos[i] = (Math.random() - 0.5) * 10;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.05,
      color: '#EC4899',
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, pMat);
    scene.add(particles);

    
    ScrollTrigger.create({
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const progress = self.progress;
        
        if (self.getVelocity() > 200 || self.getVelocity() < -200) {
          gsap.to([material, pMat], { opacity: 0.6, duration: 0.5 });
        } else {
          gsap.to([material, pMat], { opacity: 0, duration: 1.5 });
        }
        
        
        const camPos = path.getPointAt(progress % 1);
        const lookAt = path.getPointAt((progress + 0.01) % 1);
        camera.position.copy(camPos);
        camera.lookAt(lookAt);
      }
    });

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let animId;
    const animate = () => {
      const t = clock.getElapsedTime();
      tube.rotation.z = t * 0.2;
      particles.rotation.z = t * -0.3;
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      particleGeo.dispose();
      pMat.dispose();
      if (mountRef.current?.contains(renderer.domElement)) mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-[1]" />;
}
