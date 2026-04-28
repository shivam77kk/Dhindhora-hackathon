'use client';
import { useEffect, useRef, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import useSocketStore from '@/store/socketStore';
import { connectSocket } from '@/lib/socket';
import api from '@/lib/api';

// ── Lat/Lng → 3D sphere XYZ ─────────────────────────────────────────────────
function latLngToXYZ(lat, lng, radius = 1.02) {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return [
    -(radius * Math.sin(phi) * Math.cos(theta)),
     (radius * Math.cos(phi)),
     (radius * Math.sin(phi) * Math.sin(theta)),
  ];
}

// ── Country flag emoji from country code ─────────────────────────────────────
function countryCodeToFlag(code) {
  if (!code || code === 'XX') return '🌐';
  return code.toUpperCase().replace(/./g, c =>
    String.fromCodePoint(127397 + c.charCodeAt(0))
  );
}

// ── Single glowing visitor dot ───────────────────────────────────────────────
function VisitorDot({ lat, lng, isNew, country }) {
  const meshRef    = useRef();
  const glowRef    = useRef();
  const [opacity, setOpacity] = useState(isNew ? 0 : 0.85);
  const ageRef     = useRef(0);
  const position   = latLngToXYZ(lat, lng);
  const color      = isNew ? '#22D3EE' : '#6366F1';
  const glowColor  = isNew ? '#22D3EE' : '#6366F1';

  useFrame((state, delta) => {
    ageRef.current += delta;

    if (meshRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3 + lat) * 0.3;
      meshRef.current.scale.setScalar(isNew ? pulse * 1.4 : pulse);
    }
    if (isNew && ageRef.current < 0.6) {
      setOpacity(Math.min(0.9, ageRef.current / 0.6 * 0.9));
    }
    if (glowRef.current) {
      const s = isNew ? 1 + (ageRef.current % 2) * 1.5 : 1 + Math.sin(state.clock.elapsedTime * 2 + lng) * 0.2;
      glowRef.current.scale.setScalar(s);
      glowRef.current.material.opacity = isNew ? Math.max(0, 0.6 - (ageRef.current % 2) * 0.3) : 0.4;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} transparent opacity={opacity} />
      </mesh>

      <mesh ref={glowRef}>
        <ringGeometry args={[0.015, 0.025, 16]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ── Glowing arc between two points ────────────────────────────────────────────
function VisitorArc({ from, to }) {
  const lineRef = useRef();
  const curve   = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...from),
    new THREE.Vector3(0, 1.5, 0),
    new THREE.Vector3(...to)
  );
  const points  = curve.getPoints(30);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.25 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
    }
  });

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color="#6366F1" transparent opacity={0.3} />
    </line>
  );
}

// ── Earth globe mesh ──────────────────────────────────────────────────────────
function EarthGlobe({ visitors, newVisitorId }) {
  const globeRef  = useRef();
  const atmRef    = useRef();

  // Load real Earth textures for the galaxy theme
  const [colorMap, bumpMap] = useTexture([
    'https://unpkg.com/three-globe/example/img/earth-night.jpg',
    'https://unpkg.com/three-globe/example/img/earth-topology.png'
  ]);

  useFrame((state, delta) => {
    if (globeRef.current) globeRef.current.rotation.y += delta * 0.05;
    if (atmRef.current)   atmRef.current.rotation.y   += delta * 0.05;
  });

  const userPos = latLngToXYZ(20, 80);

  return (
    <group>
      <mesh ref={globeRef} castShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={colorMap}
          bumpMap={bumpMap}
          bumpScale={0.02}
          roughness={0.6}
          metalness={0.1}
          emissive="#111122"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Glowing Atmosphere */}
      <mesh ref={atmRef}>
        <sphereGeometry args={[1.03, 48, 48]} />
        <meshBasicMaterial 
          color="#6366F1" 
          transparent 
          opacity={0.15} 
          blending={THREE.AdditiveBlending} 
          side={THREE.BackSide} 
        />
      </mesh>

      {visitors.map((v) => (
        <VisitorDot
          key={v._id || `${v.lat}-${v.lng}`}
          lat={v.lat}
          lng={v.lng}
          country={v.country}
          isNew={v._id === newVisitorId}
        />
      ))}

      {visitors.slice(0, 4).map((v, i) => (
        <VisitorArc
          key={`arc-${i}`}
          from={userPos}
          to={latLngToXYZ(v.lat, v.lng)}
        />
      ))}
    </group>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
export default function VisitorGlobe({ webreelId = 'global' }) {
  const [visitors, setVisitors]       = useState([]);
  const [topCountries, setTopCountries] = useState([]);
  const [newVisitorId, setNewVisitorId] = useState(null);
  const [totalToday, setTotalToday]   = useState(0);
  const [loading, setLoading]         = useState(true);
  const { socket, setSocket } = useSocketStore();

  // Connect socket on mount
  useEffect(() => {
    const s = connectSocket();
    setSocket(s);
  }, [setSocket]);

  // Track ourselves on mount
  useEffect(() => {
    const track = async () => {
      try {
        const socketId = socket?.id || '';
        await api.post('/globe/track', { webreelId, socketId });
      } catch { /* non-blocking */ }
    };
    if (webreelId) track();
  }, [webreelId, socket?.id]);

  // Fetch existing visitors
  useEffect(() => {
    const fetchVisitors = async () => {
      setLoading(true);
      try {
        const [visRes, statsRes] = await Promise.all([
          api.get(`/globe/visitors/${webreelId}`),
          api.get('/globe/stats'),
        ]);
        setVisitors(visRes.data.data.visitors || []);
        setTopCountries(visRes.data.data.topCountries || []);
        setTotalToday(statsRes.data.data.totalToday || 0);
      } catch (err) {
        console.error('Globe fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVisitors();
  }, [webreelId]);

  // Socket.io: real-time new visitors
  useEffect(() => {
    if (!socket) return;
    socket.emit('globe:join', { webreelId });

    const onNewVisitor = (visitor) => {
      setVisitors(prev => {
        const updated = [visitor, ...prev];
        return updated.slice(0, 200);
      });
      setNewVisitorId(visitor._id);
      setTimeout(() => setNewVisitorId(null), 4000);
    };

    socket.on(`globe:visitor-arrived:${webreelId}`, onNewVisitor);

    return () => {
      socket.off(`globe:visitor-arrived:${webreelId}`, onNewVisitor);
      socket.emit('globe:leave', { webreelId });
    };
  }, [socket, webreelId]);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-5 items-stretch">
      {/* Globe Canvas */}
      <div className="flex-1 relative rounded-2xl overflow-hidden border border-[#6366F1]/20 shadow-[0_0_50px_rgba(99,102,241,0.15)] min-h-[50vh] lg:min-h-[600px]"
        style={{ background: '#05070D' }}
      >
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              className="w-16 h-16 rounded-full border-4 border-[#6366F1] border-t-transparent shadow-[0_0_15px_#6366F1]"
            />
            <p className="text-white/70 font-semibold tracking-widest text-sm uppercase">Mapping Galaxy...</p>
          </div>
        )}

        {/* Live badge */}
        <div className="absolute top-6 left-6 z-10 flex items-center gap-3 glass-heavy rounded-full px-4 py-2 border border-[#6366F1]/30">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22D3EE] animate-pulse shadow-[0_0_10px_#22D3EE]" />
          <span className="text-white/90 text-sm font-black tracking-widest">LIVE GALAXY</span>
          <span className="text-[#06b6d4] font-bold text-sm bg-[#06b6d4]/10 px-2 py-0.5 rounded-md">{visitors.length} nodes</span>
        </div>

        {/* New visitor flash */}
        <AnimatePresence>
          {newVisitorId && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-6 right-6 z-10 glass-heavy rounded-xl px-5 py-3 border border-yellow-400/50 shadow-[0_0_20px_rgba(250,204,21,0.3)]"
            >
              <p className="text-yellow-300 text-sm font-black tracking-wide uppercase">🌟 New Signal Detected!</p>
            </motion.div>
          )}
        </AnimatePresence>

        <Canvas
          camera={{ position: [0, 0, 3.2], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.1} />
          <directionalLight position={[5, 3, 5]} intensity={2.5} color="#ffffff" />
          <pointLight position={[-10, -5, -10]} intensity={1} color="#6366F1" />
          <Stars radius={150} depth={60} count={5000} factor={6} saturation={1} fade speed={0.5} />
          
          <Suspense fallback={null}>
            <EarthGlobe visitors={visitors} newVisitorId={newVisitorId} />
          </Suspense>

          <OrbitControls
            enableZoom={true}
            minDistance={1.8}
            maxDistance={5}
            enablePan={false}
            autoRotate={visitors.length === 0}
            autoRotateSpeed={0.5}
          />
        </Canvas>

        {/* Stats bar at bottom */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-6 glass rounded-full px-6 py-2">
          <div className="text-center">
            <div className="text-brand-400 font-black text-lg leading-none">{visitors.length}</div>
            <div className="text-white/40 text-xs">On Map</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-neon-pink font-black text-lg leading-none">{totalToday}</div>
            <div className="text-white/40 text-xs">Today</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-cyan-400 font-black text-lg leading-none">{topCountries.length}</div>
            <div className="text-white/40 text-xs">Countries</div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-72 space-y-4">
        <div className="glass rounded-2xl p-5 border border-white/10">
          <h3 className="font-display font-bold text-base gradient-text mb-4 flex items-center gap-2">
            🌍 Top Countries
            <span className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </h3>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {topCountries.map((c, i) => (
              <motion.div
                key={c.countryCode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3"
              >
                <span className="text-xl w-8">{countryCodeToFlag(c.countryCode)}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-white/70 text-xs">{c.country}</span>
                    <span className="text-brand-400 text-xs font-bold">{c.count}</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (c.count / (topCountries[0]?.count || 1)) * 100)}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                      className="h-full bg-gradient-to-r from-brand-500 to-neon-pink rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
            {topCountries.length === 0 && (
              <p className="text-white/30 text-xs text-center py-4">No visitor data yet</p>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 border border-white/10">
          <h3 className="font-display font-bold text-base gradient-text mb-4">🛬 Recent Arrivals</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence initial={false}>
              {visitors.slice(0, 10).map((v, i) => (
                <motion.div
                  key={v._id || i}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-center gap-3 glass rounded-xl p-2.5 border ${
                    v._id === newVisitorId ? 'border-yellow-400/50' : 'border-white/5'
                  }`}
                >
                  <span className="text-lg">{countryCodeToFlag(v.countryCode)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-xs font-semibold truncate">{v.country}</p>
                    <p className="text-white/40 text-xs truncate">{v.city || 'Unknown city'}</p>
                  </div>
                  {v._id === newVisitorId && (
                    <span className="text-yellow-400 text-xs font-bold animate-pulse">NEW</span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {visitors.length === 0 && !loading && (
              <p className="text-white/30 text-xs text-center py-4">Be the first visitor!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
