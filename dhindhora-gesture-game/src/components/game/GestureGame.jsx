'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaPipe } from '@/hooks/useMediaPipe';
import useSocketStore from '@/store/socketStore';
import { connectSocket } from '@/lib/socket';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const GAME_W = 480, GAME_H = 600, PLAYER_W = 50, PLAYER_H = 50, STAR_SIZE = 20, OBSTACLE_W = 40, OBS_SPEED = 6.0;
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
    <div className="arcade-panel p-5 h-fit w-full">
      <h3 className="font-arcade text-sm text-[#f43f5e] mb-4 flex items-center gap-2 tracking-widest drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]">
        🏆 HIGH SCORES
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {scores.map((s, i) => (
          <motion.div key={s._id} layout initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
            className={`rounded-lg p-3 border-2 flex items-center gap-3 bg-[#020617]/50 ${s._id === newScoreId ? 'border-[#eab308] shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'border-[#334155]'}`}>
            <span className={`text-lg w-7 text-center flex-shrink-0 font-arcade text-xs ${i < 3 ? ['text-[#eab308]','text-slate-300','text-amber-600'][i] : 'text-white/30'}`}>
              {i < 3 ? ['1ST','2ND','3RD'][i] : `#${i+1}`}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[#22d3ee] text-sm font-bold truncate tracking-wide font-arcade">{s.playerName.toUpperCase()}</div>
              <div className="text-white/50 text-xs font-bold mt-1 tracking-wider">LVL {s.level} · ⭐{s.stars}</div>
            </div>
            <div className="text-[#f43f5e] font-arcade text-xs flex-shrink-0 drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]">{s.score?.toLocaleString()}</div>
          </motion.div>
        ))}
        {scores.length === 0 && <p className="text-white/30 text-xs text-center py-6 font-arcade">NO SCORES YET</p>}
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
    if (!mpReady || !window.Hands || !window.Camera) { setStartError('SYSTEM LOADING. PLEASE WAIT...'); return; }
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
      setStartError(err.name === 'NotAllowedError' ? 'CAMERA PERMISSION DENIED!' : err.message.toUpperCase());
    }
  };

  function initGS() {
    return { playerX: GAME_W/2-PLAYER_W/2, playerY: GAME_H-100, score: 0, level: 1, lives: 3, stars: 0, gestures: 0, startTime: Date.now(), obstacles: [], starItems: [], particles: [], shield: false, shieldTimer: 0, magnet: false, magnetTimer: 0, speed: OBS_SPEED, obsInt: 45, fc: 0, running: true };
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
    setPhase('playing'); setLiveScore(0); setLiveLevel(1);

    const tryStart = () => {
      const canvas = gameCanvasRef.current; 
      if (!canvas) {
        setTimeout(tryStart, 50);
        return;
      }
      
      const ctx = canvas.getContext('2d');
      const gs = initGS(); gameStateRef.current = gs;

      const loop = () => {
        if (!gameStateRef.current?.running) return;
        const g = gameStateRef.current; g.fc++;
        const lm = lastLmRef.current;
        if (lm) {
          const gest = detectGesture(lm);
          const targetX = Math.max(0, Math.min(GAME_W-PLAYER_W, (1-lm[INDEX_TIP].x)*GAME_W - PLAYER_W/2));
          g.playerX += (targetX - g.playerX) * 0.2; // Smooth movement
          if (gest==='pinch' && !g.magnet) { g.magnet=true; g.magnetTimer=180; g.gestures++; }
          if (gest==='fist' && !g.shield) { g.shield=true; g.shieldTimer=120; g.gestures++; }
        }
        if (g.magnet) { g.magnetTimer--; if (g.magnetTimer<=0) g.magnet=false; }
        if (g.shield) { g.shieldTimer--; if (g.shieldTimer<=0) g.shield=false; }

        if (g.fc%g.obsInt===0) g.obstacles.push({ x: Math.random()*(GAME_W-OBSTACLE_W), y: -OBSTACLE_W, w: OBSTACLE_W, h: OBSTACLE_W, color: `hsl(${Math.random()*360},90%,50%)` });
        if (g.fc%40===0) g.starItems.push({ x: Math.random()*(GAME_W-STAR_SIZE), y: -STAR_SIZE, active: true });

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
        if (nl > g.level) { g.level=nl; g.speed=OBS_SPEED+(g.level-1)*1.2; g.obsInt=Math.max(15,45-(g.level-1)*6); setLiveLevel(g.level); }
        setLiveScore(g.score);

        // Draw
        ctx.clearRect(0,0,GAME_W,GAME_H);
        
        // Retro Grid Background
        ctx.fillStyle='#020617'; ctx.fillRect(0,0,GAME_W,GAME_H);
        ctx.strokeStyle='rgba(34, 211, 238, 0.15)'; ctx.lineWidth=2;
        const gridOffset = (g.fc * g.speed * 0.5) % 40;
        for(let x=0;x<GAME_W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,GAME_H);ctx.stroke();}
        for(let y=-40;y<GAME_H;y+=40){ctx.beginPath();ctx.moveTo(0,y+gridOffset);ctx.lineTo(GAME_W,y+gridOffset);ctx.stroke();}

        g.obstacles.forEach(o => { ctx.fillStyle=o.color; ctx.shadowColor=o.color; ctx.shadowBlur=15; roundRect(ctx,o.x,o.y,o.w,o.h,4); ctx.fill(); ctx.shadowBlur=0; });
        g.starItems.forEach(s => { ctx.fillStyle='#eab308'; ctx.shadowColor='#eab308'; ctx.shadowBlur=20; ctx.font=`${STAR_SIZE}px serif`; ctx.fillText('⭐',s.x,s.y+STAR_SIZE); ctx.shadowBlur=0; });

        if (g.shield) { ctx.strokeStyle='#22d3ee'; ctx.lineWidth=4; ctx.shadowColor='#22d3ee'; ctx.shadowBlur=25; ctx.beginPath(); ctx.arc(g.playerX+PLAYER_W/2,g.playerY+PLAYER_H/2,PLAYER_W*0.8,0,Math.PI*2); ctx.stroke(); ctx.shadowBlur=0; }
        if (g.magnet) { const gr=ctx.createRadialGradient(g.playerX+PLAYER_W/2,g.playerY+PLAYER_H/2,0,g.playerX+PLAYER_W/2,g.playerY+PLAYER_H/2,150); gr.addColorStop(0,'rgba(244,63,94,0.2)'); gr.addColorStop(1,'rgba(244,63,94,0)'); ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(g.playerX+PLAYER_W/2,g.playerY+PLAYER_H/2,150,0,Math.PI*2); ctx.fill(); }

        ctx.fillStyle='#22d3ee'; ctx.shadowColor='#22d3ee'; ctx.shadowBlur=20; ctx.font=`${PLAYER_H}px serif`; ctx.fillText('🚀',g.playerX,g.playerY+PLAYER_H); ctx.shadowBlur=0;
        
        // UI overlay
        for(let i=0;i<g.lives;i++){ctx.font='20px serif';ctx.fillText('❤️',15+i*28,30);}
        ctx.fillStyle='#f43f5e'; ctx.font='900 18px "Press Start 2P"'; ctx.textAlign='right'; ctx.fillText(`${g.score}`,GAME_W-15,35); 
        ctx.fillStyle='#22d3ee'; ctx.font='900 12px "Press Start 2P"'; ctx.fillText(`LVL ${g.level}`,GAME_W-15,60); ctx.textAlign='left';

        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    };
    tryStart();
  }, [endGame]);

  useEffect(() => () => { cancelAnimationFrame(rafRef.current); cameraRef.current?.stop(); handsRef.current?.close?.(); streamRef.current?.getTracks().forEach(t=>t.stop()); }, []);

  const GL = { point:'☝️ MOVE', pinch:'🧲 MAGNET', fist:'🛡️ SHIELD', none:'🖐️ SHOW HAND' };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 items-start relative z-10">
      <div className="flex-1 w-full max-w-lg mx-auto lg:max-w-none">
        <AnimatePresence mode="wait">
          {phase === 'menu' && (
            <motion.div key="menu" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0}} className="arcade-panel overflow-hidden relative">
              <div className="scanline" />
              <div className="p-8 lg:p-12 text-center space-y-8">
                <motion.div animate={{y:[0,-10,0]}} transition={{repeat:Infinity,duration:1.5}} className="text-6xl drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">🛸</motion.div>
                <div>
                  <h2 className="text-3xl lg:text-4xl font-black text-[#22d3ee] mb-3 tracking-widest font-arcade">DODGE<br/>PROTOCOL</h2>
                  <p className="text-[#94a3b8] font-bold text-sm tracking-widest leading-relaxed">USE HAND GESTURES TO NAVIGATE.<br/>AVOID RED ASTEROIDS.<br/>COLLECT STARS.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[{g:'☝️',l:'STEER',d:'INDEX UP'},{g:'🤏',l:'MAGNET',d:'PINCH FINGERS'},{g:'✊',l:'SHIELD',d:'MAKE FIST'}].map(c=>(
                    <div key={c.g} className="bg-[#0f172a] rounded-xl p-4 border-2 border-[#334155] text-center shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]">
                      <div className="text-3xl mb-2">{c.g}</div>
                      <div className="text-[#f43f5e] text-[10px] font-arcade tracking-widest mb-1">{c.l}</div>
                      <div className="text-[#64748b] text-[9px] font-bold tracking-widest">{c.d}</div>
                    </div>
                  ))}
                </div>
                <button onClick={()=>setPhase('name')} className="arcade-btn w-full py-5 text-xl mt-4 relative overflow-hidden group">
                  <span className="relative z-10">INSERT COIN TO PLAY</span>
                  <div className="absolute inset-0 bg-white/20 -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'name' && (
            <motion.div key="name" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0}} className="arcade-panel p-8 lg:p-12 space-y-8 relative">
              <div className="scanline" />
              <h3 className="text-xl lg:text-2xl font-arcade text-[#22d3ee] text-center tracking-widest drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">PLAYER REGISTRATION</h3>
              <input value={playerName} onChange={e=>setPlayerName(e.target.value.toUpperCase())} placeholder="ENTER CALLSIGN..." maxLength={15}
                onKeyDown={e=>{if(e.key==='Enter'&&playerName.trim()&&cameraReady)startGame();}}
                className="arcade-input w-full text-center text-xl h-16 uppercase" />
              
              <div className="bg-[#0f172a] rounded-xl p-5 border-2 border-[#334155]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[#94a3b8] font-arcade text-xs tracking-widest">SENSORS</span>
                  {cameraReady ? <span className="text-[#10b981] font-arcade text-[10px] flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981] animate-pulse" /> LINKED</span>
                    : <span className="text-[#f43f5e] font-arcade text-[10px] flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] shadow-[0_0_8px_#f43f5e]" /> OFFLINE</span>}
                </div>
                {!cameraReady && <button onClick={startCamera} disabled={!mpReady}
                  className="w-full py-3 rounded-lg bg-[#334155] hover:bg-[#475569] border-2 border-[#64748b] text-white font-arcade text-xs transition-colors disabled:opacity-50">
                  {mpReady ? '[ INITIATE SCANNER ]' : '[ BOOTING AI CORE... ]'}</button>}
              </div>
              
              {startError && <p className="text-[#f43f5e] text-xs font-arcade text-center animate-pulse">{startError}</p>}
              
              <button onClick={startGame} disabled={!playerName.trim()||!cameraReady}
                className="arcade-btn w-full py-5 text-xl disabled:opacity-50 disabled:grayscale">
                {!cameraReady ? 'WAITING FOR SENSOR...' : 'LAUNCH SEQUENCE'}
              </button>
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div key="playing" initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
              <div className="flex items-center justify-between bg-[#0f172a] rounded-xl px-6 py-4 border-2 border-[#334155] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <div className="text-[#22d3ee] font-arcade text-sm">SCORE <span className="text-white ml-2 drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">{liveScore.toLocaleString()}</span></div>
                <div className="text-[#eab308] font-arcade text-xs px-3 py-1 bg-[#eab308]/20 rounded border border-[#eab308]/50">LVL {liveLevel}</div>
                <div className="text-[#f43f5e] font-arcade text-xs">{GL[gesture]||'NO SIGNAL'}</div>
              </div>
              <div className="arcade-panel-active rounded-xl overflow-hidden relative">
                <div className="scanline" />
                <canvas ref={gameCanvasRef} width={GAME_W} height={GAME_H} className="w-full h-auto max-h-[60vh] object-contain bg-[#020617]" />
              </div>
            </motion.div>
          )}

          {phase === 'gameover' && gameStats && (
            <motion.div key="go" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0}} className="arcade-panel p-8 lg:p-12 text-center space-y-8 relative">
              <div className="scanline" />
              <motion.div animate={{scale:[1,1.1,1]}} transition={{repeat:Infinity,duration:0.5}} className="text-6xl drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]">💥</motion.div>
              <div>
                <h3 className="text-3xl lg:text-4xl font-arcade text-[#f43f5e] mb-3 tracking-widest drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]">MISSION FAILED</h3>
                <p className="text-[#22d3ee] font-arcade text-xs tracking-widest">PILOT: {playerName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                {[{l:'SCORE',v:gameStats.score.toLocaleString(),c:'text-white'},{l:'LEVEL',v:gameStats.level,c:'text-[#eab308]'},{l:'STARS',v:gameStats.stars,c:'text-[#eab308]'},{l:'MOVES',v:gameStats.gestures,c:'text-[#22d3ee]'}].map(s=>(
                  <div key={s.l} className="bg-[#0f172a] rounded-xl p-4 border-2 border-[#334155] shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                    <div className={`${s.c} font-arcade text-lg mb-2 drop-shadow-[0_0_5px_currentColor]`}>{s.v}</div>
                    <div className="text-[#64748b] font-arcade text-[9px] tracking-widest">{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button onClick={()=>{setPhase('name');setGameStats(null);}}
                  className="flex-1 py-4 rounded-xl bg-[#334155] hover:bg-[#475569] border-2 border-[#64748b] text-white font-arcade text-xs transition-colors shadow-lg">
                  SWITCH PILOT
                </button>
                <button onClick={startGame}
                  className="arcade-btn flex-1 py-4 text-xs">
                  RETRY MISSION
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`mt-4 bg-[#0f172a] rounded-xl p-2 border-2 border-[#334155] shadow-[0_0_15px_rgba(0,0,0,0.5)] ${phase === 'playing' || (phase === 'name' && cameraReady) ? 'block' : 'hidden'}`}>
          <div className="relative rounded-lg overflow-hidden h-28 flex items-center justify-center bg-black/50">
            <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen" style={{transform:'scaleX(-1)'}} />
            <canvas ref={camCanvasRef} width={320} height={240} className="absolute inset-0 w-full h-full" style={{transform:'scaleX(-1)'}} />
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur rounded px-2 py-1 flex items-center gap-2 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e] shadow-[0_0_5px_#f43f5e] animate-pulse" /><span className="text-[#94a3b8] font-arcade text-[8px] tracking-widest">LIVE FEED</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-80 flex-shrink-0"><Leaderboard scores={scores} newScoreId={newScoreId} /></div>
    </div>
  );
}
