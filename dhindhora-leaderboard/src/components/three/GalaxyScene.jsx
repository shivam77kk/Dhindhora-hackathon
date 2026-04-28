'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function GalaxyScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    
    
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x050510, 1);
    mountRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 0, 0);

    scene.fog = new THREE.FogExp2(0x050510, 0.025);

    const count = 1000000; 
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const colorInside = new THREE.Color('#6C63FF');
    const colorOutside = new THREE.Color('#EC4899');
    const radius = 8;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = Math.random() * radius;
      const spin = r * 1.2;
      const branch = (i % 5) / 5 * Math.PI * 2;
      const rp = 3.5;
      const rx = Math.pow(Math.random(), rp) * (Math.random() < 0.5 ? 1 : -1) * 0.25 * r;
      const ry = Math.pow(Math.random(), rp) * (Math.random() < 0.5 ? 1 : -1) * 0.25 * r * 0.3;
      const rz = Math.pow(Math.random(), rp) * (Math.random() < 0.5 ? 1 : -1) * 0.25 * r;
      positions[i3] = Math.cos(branch + spin) * r + rx;
      positions[i3 + 1] = ry;
      positions[i3 + 2] = Math.sin(branch + spin) * r + rz;
      const c = colorInside.clone().lerp(colorOutside, r / radius);
      colors[i3] = c.r; colors[i3 + 1] = c.g; colors[i3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({ size: 0.002, sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true });
    const galaxy = new THREE.Points(geometry, material);
    scene.add(galaxy);

    const coreGlow = new THREE.PointLight('#6C63FF', 2, 5);
    scene.add(coreGlow);

    let mouseX = 0, mouseY = 0;
    const onMouse = (e) => { mouseX = (e.clientX / window.innerWidth - 0.5) * 0.4; mouseY = (e.clientY / window.innerHeight - 0.5) * 0.25; };
    window.addEventListener('mousemove', onMouse);
    const onResize = () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let animId;
    const animate = () => {
      const t = clock.getElapsedTime();
      galaxy.rotation.y = t * 0.04;
      camera.position.x += (mouseX - camera.position.x) * 0.04;
      camera.position.y += (-mouseY + 3 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
      coreGlow.intensity = 2 + Math.sin(t * 0.5) * 0.5;
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (mountRef.current?.contains(renderer.domElement)) mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}
