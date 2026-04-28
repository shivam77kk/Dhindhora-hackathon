'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaPipe } from '@/hooks/useMediaPipe';
import useSocketStore from '@/store/socketStore';
import { connectSocket } from '@/lib/socket';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const GAME_W = 480, GAME_H = 600, PLAYER_W = 50, PLAYER_H = 50, STAR_SIZE = 20, OBSTACLE_W = 40, OBS_SPEED = 3.5;
const INDEX_TIP = 8, INDEX_MCP = 5, MIDDLE_TIP = 12, MIDDLE_MCP = 9, THUMB_TIP = 4, RING_TIP = 16, PINKY_TIP = 20;

function detectGesture(lm) {
  if (!lm || lm.length < 21) return 'none';
  const indexUp = lm[INDEX_TIP].y < lm[INDEX_MCP].y;
  const middleUp = lm[MIDDLE_TIP].y < lm[MIDDLE_MCP].y;
  const dx = lm[INDEX_TIP].x - lm[THUMB_TIP].x;
  const dy = lm[INDEX_TIP].y - lm[THUMB_TIP].y;
  if (Math.sqrt(dx*dx+dy*dy) < 0.06) return 'pinch';
  if ([INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP].every(t => lm[t].y > lm[t-2].y)) return 'fist';
  if (indexUp && !middleUp) return 'point';
  return 'none';
}

function Leaderboard({ scores, newScoreId }) {
  return (
    <div className="glass rounded-2xl p-5 border border-white/10 h-fit">
      <h3 className="font-display font-bold text-base gradient-text mb-4 flex items-center gap-2">
        🏆 Top Scores <span className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {scores.map((s, i) => (
          <motion.div key={s._id} layout initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
            className={`glass rounded-xl p-3 border flex items-center gap-3 ${s._id === newScoreId ? 'border-yellow-400/60' : 'border-white/5'}`}>
            <span className={`text-lg w-7 text-center flex-shrink-0 ${i < 3 ? ['text-yellow-400','text-slate-300','text-amber-600'][i] : 'text-white/30'}`}>
              {i < 3 ? ['🥇','🥈','🥉'][i] : `${i+1}`}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-semibold truncate">{s.playerName}</div>
              <div className="text-white/40 text-xs">Lv {s.level} · ⭐{s.stars}</div>
            </div>
            <div className="text-brand-400 font-black text-sm flex-shrink-0">{s.score?.toLocaleString()}</div>
          </motion.div>
        ))}
        {scores.length === 0 && <p className="text-white/30 text-xs text-center py-6">No scores yet. Be the first!</p>}
      </div>
    </div>
  );
}

export default function GestureGame() {
  const videoRef = useRef(null), gameCanvasRef = useRef(null), camCanvasRef = useRef(null);
  const handsRef = useRef(null), cameraRef = useRef(null), streamRef = useRef(null);
  const gameStateRef = useRef(null), rafRef = useRef(null), lastLmRef = useRef(null);

  const [phase, setPhase] = useState('menu');
  const [playerName, setPlayerName] = useState('');
  const [scores, setScores] = useState([]);
  const [newScoreId, setNewScoreId] = useState(null);
  const [liveScore, setLiveScore] = useState(0);
  const [liveLevel, setLiveLevel] = useState(1);
  const [gesture, setGesture] = useState('none');
  const [gameStats, setGameStats] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [startError, setStartError] = useState('');

  const { ready: mpReady } = useMediaPipe();
  const { socket, setSocket } = useSocketStore();

  useEffect(() => { const s = connectSocket(); setSocket(s); }, [setSocket]);

  const fetchLeaderboard = useCallback(async () => {
    try { const { data } = await api.get('/game/leaderboard'); setScores(data.data || []); } catch {}
  }, []);
  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('game:join-leaderboard');
    const onNew = (entry) => {
      setScores(prev => [entry, ...prev.filter(s => s._id !== entry._id)].sort((a,b) => b.score - a.score).slice(0, 25));
      setNewScoreId(entry._id);
      setTimeout(() => setNewScoreId(null), 5000);
    };
    socket.on('game:new-score', onNew);
    return () => { socket.off('game:new-score', onNew); socket.emit('game:leave-leaderboard'); };
  }, [socket]);

  const startCamera = async () => {
    setStartError('');
    if (!mpReady || !window.Hands || !window.Camera) { setStartError('MediaPipe loading. Wait...'); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: 'user' } });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await new Promise(r => { videoRef.current.onloadedmetadata = r; });
      videoRef.current.play();

      const hands = new window.Hands({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${f}` });
      hands.setOptions({ maxNumHands: 1, modelComplexity: 0, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });
      hands.onResults((res) => {
        if (res.multiHandLandmarks?.length) { lastLmRef.current = res.multiHandLandmarks[0]; setGesture(detectGesture(res.multiHandLandmarks[0])); }
        else { lastLmRef.current = null; setGesture('none'); }
      });
      handsRef.current = hands;

      const camera = new window.Camera(videoRef.current, {
        onFrame: async () => { 
          try {
            if (handsRef.current && videoRef.current && videoRef.current.readyState >= 2) {
              await handsRef.current.send({ image: videoRef.current }); 
            }
          } catch (e) {
            console.warn('MediaPipe error:', e);
          }
        },
        width: 320, height: 240,
      });
      camera.start();
      cameraRef.current = camera;
      setCameraReady(true);
    } catch (err) {
      setStartError(err.name === 'NotAllowedError' ? 'Camera permission denied!' : err.message);
    }
  };

  function initGS() {
    return { playerX: GAME_W/2-PLAYER_W/2, playerY: GAME_H-100, score: 0, level: 1, lives: 3, stars: 0, gestures: 0, startTime: Date.now(), obstacles: [], starItems: [], particles: [], shield: false, shieldTimer: 0, magnet: false, magnetTimer: 0, speed: OBS_SPEED, obsInt: 80, fc: 0, running: true };
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h);
    ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
  }

  const endGame = useCallback(async (gs) => {
    gs.running = false;
    cancelAnimationFrame(rafRef.current);
    const stats = { score: gs.score, level: gs.level, stars: gs.stars, gestures: gs.gestures, duration: Math.round((Date.now()-gs.startTime)/1000) };
    setGameStats(stats);
    setPhase('gameover');
    if (playerName.trim()) {
      try { const { data } = await api.post('/game/score', { playerName, ...stats }); setNewScoreId(data.data._id); } catch {}
    }
    fetchLeaderboard();
  }, [playerName, fetchLeaderboard]);

  const startGame = useCallback(() => {
    const canvas = gameCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const gs = initGS(); gameStateRef.current = gs;
    setPhase('playing'); setLiveScore(0); setLiveLevel(1);

    const loop = () => {
      if (!gameStateRef.current?.running) return;
      const g = gameStateRef.current; g.fc++;
      const lm = lastLmRef.current;
      if (lm) {
        const gest = detectGesture(lm);
        g.playerX = Math.max(0, Math.min(GAME_W-PLAYER_W, (1-lm[INDEX_TIP].x)*GAME_W - PLAYER_W/2));
        if (gest==='pinch' && !g.magnet) { g.magnet=true; g.magnetTimer=180; g.gestures++; }
        if (gest==='fist' && !g.shield) { g.shield=true; g.shieldTimer=120; g.gestures++; }
      }
      if (g.magnet) { g.magnetTimer--; if (g.magnetTimer<=0) g.magnet=false; }
      if (g.shield) { g.shieldTimer--; if (g.shieldTimer<=0) g.shield=false; }

      if (g.fc%g.obsInt===0) g.obstacles.push({ x: Math.random()*(GAME_W-OBSTACLE_W), y: -OBSTACLE_W, w: OBSTACLE_W, h: OBSTACLE_W, color: `hsl(${Math.random()*360},70%,60%)` });
      if (g.fc%90===0) g.starItems.push({ x: Math.random()*(GAME_W-STAR_SIZE), y: -STAR_SIZE, active: true });

      g.obstacles = g.obstacles.filter(o => {
        o.y += g.speed;
        const hx = o.x < g.playerX+PLAYER_W && o.x+o.w > g.playerX;
        const hy = o.y < g.playerY+PLAYER_H && o.y+o.h > g.playerY;
        if (hx && hy) { if (g.shield) { g.shield=false; g.shieldTimer=0; return false; } g.lives--; if (g.lives<=0) endGame(g); return false; }
        return o.y < GAME_H+OBSTACLE_W;
      });

      g.starItems = g.starItems.filter(s => {
        if (!s.active) return false;
        if (g.magnet) { const px=g.playerX+PLAYER_W/2,py=g.playerY+PLAYER_H/2,dx=px-(s.x+STAR_SIZE/2),dy=py-(s.y+STAR_SIZE/2),d=Math.sqrt(dx*dx+dy*dy); if(d<200){s.x+=dx/d*6;s.y+=dy/d*6;} } else { s.y+=g.speed*0.7; }
        if (s.x<g.playerX+PLAYER_W && s.x+STAR_SIZE>g.playerX && s.y<g.playerY+PLAYER_H && s.y+STAR_SIZE>g.playerY) { g.score+=50; g.stars++; return false; }
        return s.y < GAME_H+STAR_SIZE;
      });

      g.particles = g.particles.filter(p => { p.x+=p.vx; p.y+=p.vy; p.life--; return p.life>0; });
      g.score++;
      const nl = Math.floor(g.score/500)+1;
      if (nl > g.level) { g.level=nl; g.speed=OBS_SPEED+(g.level-1)*0.6; g.obsInt=Math.max(30,80-(g.level-1)*8); setLiveLevel(g.level); }
      setLiveScore(g.score);

      // Draw
      ctx.clearRect(0,0,GAME_W,GAME_H);
      const bg=ctx.createLinearGradient(0,0,0,GAME_H); bg.addColorStop(0,'#050510'); bg.addColorStop(1,'#0d0d2b'); ctx.fillStyle=bg; ctx.fillRect(0,0,GAME_W,GAME_H);
      ctx.strokeStyle='rgba(168,85,247,0.06)'; ctx.lineWidth=1;
      for(let x=0;x<GAME_W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,GAME_H);ctx.stroke();}
      for(let y=0;y<GAME_H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(GAME_W,y);ctx.stroke();}

      g.obstacles.forEach(o => { ctx.fillStyle=o.color; ctx.shadowColor=o.color; ctx.shadowBlur=12; roundRect(ctx,o.x,o.y,o.w,o.h,8); ctx.fill(); ctx.shadowBlur=0; });
      g.starItems.forEach(s => { ctx.fillStyle='#fbbf24'; ctx.shadowColor='#fbbf24'; ctx.shadowBlur=15; ctx.font=`${STAR_SIZE}px serif`; ctx.fillText('⭐',s.x,s.y+STAR_SIZE); ctx.shadowBlur=0; });

      if (g.shield) { ctx.strokeStyle='#22d3ee'; ctx.lineWidth=3; ctx.shadowColor='#22d3ee'; ctx.shadowBlur=20; ctx.beginPath(); ctx.arc(g.playerX+PLAYER_W/2,g.playerY+PLAYER_H/2,PLAYER_W*0.7,0,Math.PI*2); ctx.stroke(); ctx.shadowBlur=0; }
      if (g.magnet) { const gr=ctx.createRadialGradient(g.playerX+PLAYER_W/2,g.playerY+PLAYER_H/2,0,g.playerX+PLAYER_W/2,g.playerY+PLAYER_H/2,120); gr.addColorStop(0,'rgba(168,85,247,0.15)'); gr.addColorStop(1,'rgba(168,85,247,0)'); ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(g.playerX+PLAYER_W/2,g.playerY+PLAYER_H/2,120,0,Math.PI*2); ctx.fill(); }

      ctx.fillStyle='#a855f7'; ctx.shadowColor='#a855f7'; ctx.shadowBlur=20; ctx.font=`${PLAYER_H}px serif`; ctx.fillText('🚀',g.playerX,g.playerY+PLAYER_H); ctx.shadowBlur=0;
      for(let i=0;i<g.lives;i++){ctx.font='18px serif';ctx.fillText('❤️',10+i*24,28);}
      ctx.fillStyle='rgba(168,85,247,0.9)'; ctx.font='bold 16px sans-serif'; ctx.textAlign='right'; ctx.fillText(`${g.score}`,GAME_W-10,28); ctx.fillText(`Lv ${g.level}`,GAME_W-10,48); ctx.textAlign='left';

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [endGame]);

  useEffect(() => () => { cancelAnimationFrame(rafRef.current); cameraRef.current?.stop(); handsRef.current?.close?.(); streamRef.current?.getTracks().forEach(t=>t.stop()); }, []);

  const GL = { point:'☝️ Moving', pinch:'🧲 Magnet!', fist:'🛡️ Shield!', none:'🖐️ Show hand' };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-5 items-start">
      <div className="flex-1 space-y-4">
        <AnimatePresence mode="wait">
          {phase === 'menu' && (
            <motion.div key="menu" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="glass rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-8 text-center space-y-5">
                <motion.div animate={{y:[0,-12,0],rotate:[0,5,-5,0]}} transition={{repeat:Infinity,duration:2}} className="text-7xl">🎮</motion.div>
                <div><h2 className="text-3xl font-display font-black gradient-text mb-2">Gesture Dodge</h2><p className="text-white/50 text-sm max-w-sm mx-auto">Use hand gestures to control a rocket. Dodge obstacles, collect stars!</p></div>
                <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
                  {[{g:'☝️',l:'Move',d:'Index = steer'},{g:'🤏',l:'Magnet',d:'Pinch = attract'},{g:'✊',l:'Shield',d:'Fist = block'}].map(c=>(
                    <div key={c.g} className="glass rounded-xl p-3 text-center border border-white/5"><div className="text-2xl mb-1">{c.g}</div><div className="text-white/70 text-xs font-bold">{c.l}</div><div className="text-white/40 text-xs">{c.d}</div></div>
                  ))}
                </div>
                <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}} onClick={()=>setPhase('name')}
                  className="px-10 py-4 rounded-full bg-gradient-to-r from-brand-500 to-neon-pink text-white font-bold text-lg shadow-lg shadow-brand-500/30">Play Now 🚀</motion.button>
              </div>
            </motion.div>
          )}

          {phase === 'name' && (
            <motion.div key="name" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="glass rounded-2xl border border-white/10 p-8 space-y-5">
              <h3 className="text-2xl font-display font-black gradient-text text-center">Enter Your Name</h3>
              <input value={playerName} onChange={e=>setPlayerName(e.target.value)} placeholder="Name for leaderboard..." maxLength={30}
                onKeyDown={e=>{if(e.key==='Enter'&&playerName.trim()&&cameraReady)startGame();}}
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/30 border border-white/10 focus:border-brand-500 outline-none text-center text-lg" />
              <div className="glass rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-sm">Camera Setup</span>
                  {cameraReady ? <span className="text-green-400 text-xs flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Ready</span>
                    : <span className="text-white/40 text-xs">Not started</span>}
                </div>
                {!cameraReady && <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}} onClick={startCamera} disabled={!mpReady}
                  className="w-full py-2 rounded-lg glass border border-brand-500/50 text-brand-300 text-sm font-semibold disabled:opacity-40">
                  {mpReady ? '📷 Start Camera' : '⏳ Loading MediaPipe...'}</motion.button>}
              </div>
              {startError && <p className="text-red-400 text-sm text-center">{startError}</p>}
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}} onClick={startGame} disabled={!playerName.trim()||!cameraReady}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-500 to-neon-pink text-white font-bold text-lg shadow-lg disabled:opacity-40 disabled:cursor-not-allowed">
                {!cameraReady ? '⚡ Set up camera first' : '🚀 Start Playing!'}</motion.button>
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div key="playing" initial={{opacity:0}} animate={{opacity:1}} className="space-y-3">
              <div className="flex items-center gap-4 glass rounded-xl px-4 py-2 border border-white/10">
                <div className="text-brand-400 font-black text-lg">{liveScore.toLocaleString()}</div>
                <div className="text-white/40 text-sm">Lv {liveLevel}</div>
                <div className="ml-auto text-sm">{GL[gesture]||'🖐️'}</div>
              </div>
              <div className="relative rounded-2xl overflow-hidden border border-white/10">
                <canvas ref={gameCanvasRef} width={GAME_W} height={GAME_H} className="w-full" style={{maxHeight:500}} />
              </div>
              <div className="relative rounded-xl overflow-hidden border border-white/10 h-24">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover opacity-40" style={{transform:'scaleX(-1)'}} />
                <canvas ref={camCanvasRef} width={320} height={240} className="absolute inset-0 w-full h-full" style={{transform:'scaleX(-1)'}} />
                <div className="absolute top-2 left-2 glass rounded-full px-2 py-0.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /><span className="text-xs text-white/60">Camera</span>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'gameover' && gameStats && (
            <motion.div key="go" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0}} className="glass rounded-2xl border border-white/10 p-8 text-center space-y-5">
              <motion.div animate={{rotate:[0,-10,10,-10,0]}} transition={{repeat:Infinity,duration:2}} className="text-6xl">💥</motion.div>
              <div><h3 className="text-3xl font-display font-black gradient-text mb-1">Game Over!</h3><p className="text-white/50 text-sm">{playerName||'Player'} — here&apos;s how you did</p></div>
              <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                {[{l:'Score',v:gameStats.score.toLocaleString(),i:'🎯'},{l:'Level',v:gameStats.level,i:'⚡'},{l:'Stars',v:gameStats.stars,i:'⭐'},{l:'Gestures',v:gameStats.gestures,i:'✋'}].map(s=>(
                  <div key={s.l} className="glass rounded-xl p-4 border border-white/10"><div className="text-2xl mb-1">{s.i}</div><div className="text-white font-black text-xl">{s.v}</div><div className="text-white/40 text-xs">{s.l}</div></div>
                ))}
              </div>
              <div className="flex gap-3">
                <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}} onClick={()=>{setPhase('name');setGameStats(null);}}
                  className="flex-1 py-3 rounded-xl glass border border-white/10 text-white/60 font-semibold text-sm">Change Name</motion.button>
                <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}} onClick={startGame}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-neon-pink text-white font-bold text-sm">🚀 Play Again</motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full lg:w-72"><Leaderboard scores={scores} newScoreId={newScoreId} /></div>

      {phase !== 'playing' && <div className="hidden"><video ref={videoRef} autoPlay muted playsInline /><canvas ref={camCanvasRef} /></div>}
    </div>
  );
}
