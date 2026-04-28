'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function FloatingOrbs({ count = 15 }) {
  const mountRef = useRef(null);
  useEffect(() => {
    if (!mountRef.current) return;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 15;

    const orbs = [];
    const colors = [0x6C63FF, 0xEC4899, 0x06B6D4, 0x8B5CF6, 0x10B981];
    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(0.15 + Math.random() * 0.3, 16, 16);
      const mat = new THREE.MeshBasicMaterial({ color: colors[i % colors.length], transparent: true, opacity: 0.15 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10);
      mesh.userData = { speed: 0.002 + Math.random() * 0.005, offset: Math.random() * Math.PI * 2 };
      scene.add(mesh);
      orbs.push(mesh);
    }

    let animId;
    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      orbs.forEach(o => {
        o.position.y += Math.sin(t + o.userData.offset) * o.userData.speed;
        o.position.x += Math.cos(t * 0.5 + o.userData.offset) * o.userData.speed * 0.5;
      });
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); renderer.dispose(); if (mountRef.current?.contains(renderer.domElement)) mountRef.current.removeChild(renderer.domElement); };
  }, [count]);

  return <div ref={mountRef} className="w-full h-full" />;
}
