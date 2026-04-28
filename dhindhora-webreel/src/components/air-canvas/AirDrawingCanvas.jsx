'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStroke } from 'perfect-freehand';
import { useMediaPipe } from '@/hooks/useMediaPipe';
import useSocket from '@/hooks/useSocket';
import api from '@/lib/api';
import toast from 'react-hot-toast';


function getSvgPathFromStroke(stroke) {
  if (!stroke || stroke.length < 4) return '';
  const [firstX, firstY] = stroke[0];
  const parts = [`M ${firstX.toFixed(2)} ${firstY.toFixed(2)} Q`];
  for (let i = 0; i < stroke.length - 1; i++) {
    const [x0, y0] = stroke[i];
    const [x1, y1] = stroke[i + 1];
    parts.push(
      `${x0.toFixed(2)} ${y0.toFixed(2)} ${((x0 + x1) / 2).toFixed(2)} ${((y0 + y1) / 2).toFixed(2)}`
    );
  }
  parts.push('Z');
  return parts.join(' ');
}

function drawStrokeOnCanvas(ctx, rawPoints, color, size = 8) {
  if (!rawPoints || rawPoints.length < 2) return;
  const stroke = getStroke(rawPoints, {
    size,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
  });
  const pathData = getSvgPathFromStroke(stroke);
  if (!pathData) return;
  const path = new Path2D(pathData);
  ctx.fillStyle = color;
  ctx.fill(path);
}


const INDEX_TIP = 8;
const INDEX_MCP = 5;
const MIDDLE_TIP = 12;
const MIDDLE_MCP = 9;
const THUMB_TIP = 4;
const RING_TIP = 16;
const PINKY_TIP = 20;

const COLORS = ['#a855f7', '#ec4899', '#22d3ee', '#f97316', '#84cc16', '#fbbf24', '#ffffff'];

export default function AirDrawingCanvas({ roomId = 'global' }) {
  
  const videoRef       = useRef(null);
  const drawCanvasRef  = useRef(null);
  const overlayRef     = useRef(null);
  const handsRef       = useRef(null);
  const cameraRef      = useRef(null);
  const strokeRef      = useRef([]);   
  const allStrokesRef  = useRef([]);   
  const isDrawingRef   = useRef(false);
  const lastEmitRef    = useRef(0);
  const colorRef       = useRef('#a855f7');
  const strokeSizeRef  = useRef(8);
  const onHandResultsRef = useRef(null);

  
  const [active, setActive]             = useState(false);
  const [color, setColor]               = useState('#a855f7');
  const [strokeSize, setStrokeSize]     = useState(8);
  const [recognizing, setRecognizing]   = useState(false);
  const [shapeResult, setShapeResult]   = useState(null);
  const [collaborators, setCollaborators] = useState(0);
  const [gesture, setGesture]           = useState('none'); 
  const [startError, setStartError]     = useState('');

  
  useEffect(() => { colorRef.current = color; }, [color]);
  useEffect(() => { strokeSizeRef.current = strokeSize; }, [strokeSize]);

  const { ready: mediaPipeReady, error: mediaPipeError } = useMediaPipe();
  const { socket } = useSocket();

  
  useEffect(() => {
    if (!socket) return;

    socket.emit('draw:join-room', { roomId, username: 'Artist' });

    const onCollaboratorJoined = () => setCollaborators(c => c + 1);
    const onRoomJoined = () => {}; 
    const onRemoteStroke = ({ points, color: c, strokeWidth }) => {
      const canvas = drawCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      drawStrokeOnCanvas(ctx, points, c, strokeWidth || 8);
    };
    const onRemoteClear = () => {
      const canvas = drawCanvasRef.current;
      if (!canvas) return;
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      allStrokesRef.current = [];
    };

    socket.on('draw:collaborator-joined', onCollaboratorJoined);
    socket.on('draw:room-joined', onRoomJoined);
    socket.on('draw:air-stroke', onRemoteStroke);
    socket.on('draw:air-clear', onRemoteClear);

    return () => {
      socket.off('draw:collaborator-joined', onCollaboratorJoined);
      socket.off('draw:room-joined', onRoomJoined);
      socket.off('draw:air-stroke', onRemoteStroke);
      socket.off('draw:air-clear', onRemoteClear);
    };
  }, [socket, roomId]);

  
  const isIndexUp = useCallback((lm) => {
    return lm[INDEX_TIP].y < lm[INDEX_MCP].y && lm[MIDDLE_TIP].y > lm[MIDDLE_MCP].y;
  }, []);

  const isPinching = useCallback((lm) => {
    const dx = lm[INDEX_TIP].x - lm[THUMB_TIP].x;
    const dy = lm[INDEX_TIP].y - lm[THUMB_TIP].y;
    return Math.sqrt(dx * dx + dy * dy) < 0.045;
  }, []);

  const isFist = useCallback((lm) => {
    return [INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP].every(tip => lm[tip].y > lm[tip - 2].y);
  }, []);

  
  const onHandResults = useCallback((results) => {
    const overlay = overlayRef.current;
    const drawCanvas = drawCanvasRef.current;
    if (!overlay || !drawCanvas) return;

    
    const currentColor = colorRef.current;
    const currentSize = strokeSizeRef.current;

    const octx = overlay.getContext('2d');
    octx.clearRect(0, 0, overlay.width, overlay.height);

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      
      if (isDrawingRef.current && strokeRef.current.length > 3) {
        finalizeStroke(drawCanvas);
      }
      isDrawingRef.current = false;
      setGesture('none');
      return;
    }

    const lm = results.multiHandLandmarks[0];
    const W = overlay.width;
    const H = overlay.height;

    
    drawSkeleton(octx, lm, W, H);

    
    const tipX = (1 - lm[INDEX_TIP].x) * W;
    const tipY = lm[INDEX_TIP].y * H;

    if (isPinching(lm)) {
      setGesture('pinch');
      octx.beginPath();
      octx.arc(tipX, tipY, 20, 0, Math.PI * 2);
      octx.strokeStyle = '#fbbf24';
      octx.lineWidth = 3;
      octx.stroke();

      
      if (isDrawingRef.current && strokeRef.current.length > 3) {
        finalizeStroke(drawCanvas);
        isDrawingRef.current = false;
      }
      return;
    }

    if (isFist(lm)) {
      setGesture('fist');
      if (isDrawingRef.current) {
        finalizeStroke(drawCanvas);
        isDrawingRef.current = false;
      }
      return;
    }

    if (isIndexUp(lm)) {
      setGesture('draw');

      
      octx.beginPath();
      octx.arc(tipX, tipY, 14, 0, Math.PI * 2);
      octx.strokeStyle = currentColor;
      octx.lineWidth = 3;
      octx.globalAlpha = 0.8;
      octx.stroke();
      octx.globalAlpha = 1;

      
      strokeRef.current.push([tipX, tipY, 0.5]);
      isDrawingRef.current = true;

      
      if (strokeRef.current.length > 1) {
        const dctx = drawCanvas.getContext('2d');
        
        dctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
        allStrokesRef.current.forEach(s => drawStrokeOnCanvas(dctx, s.points, s.color, s.size));
        drawStrokeOnCanvas(dctx, strokeRef.current, currentColor, currentSize);
      }

      
      const now = Date.now();
      if (socket && now - lastEmitRef.current > 100 && strokeRef.current.length > 1) {
        socket.emit('draw:air-stroke', {
          roomId,
          points: strokeRef.current.slice(-20),
          color: currentColor,
          strokeWidth: currentSize,
        });
        lastEmitRef.current = now;
      }
    } else {
      setGesture('none');
      if (isDrawingRef.current && strokeRef.current.length > 3) {
        finalizeStroke(drawCanvas);
        isDrawingRef.current = false;
      }
    }
  }, [roomId, socket, isIndexUp, isPinching, isFist]);

  
  useEffect(() => { onHandResultsRef.current = onHandResults; }, [onHandResults]);

  const finalizeStroke = (canvas) => {
    if (strokeRef.current.length < 2) {
      strokeRef.current = [];
      return;
    }
    allStrokesRef.current.push({
      points: [...strokeRef.current],
      color: colorRef.current,
      size: strokeSizeRef.current,
    });
    strokeRef.current = [];
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokesRef.current.forEach(s => drawStrokeOnCanvas(ctx, s.points, s.color, s.size));
  };

  function drawSkeleton(ctx, lm, W, H) {
    const connections = [
      [0,1],[1,2],[2,3],[3,4],
      [0,5],[5,6],[6,7],[7,8],
      [5,9],[9,10],[10,11],[11,12],
      [9,13],[13,14],[14,15],[15,16],
      [13,17],[0,17],[17,18],[18,19],[19,20],
    ];
    ctx.strokeStyle = 'rgba(168,85,247,0.4)';
    ctx.lineWidth = 1.5;
    connections.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo((1 - lm[a].x) * W, lm[a].y * H);
      ctx.lineTo((1 - lm[b].x) * W, lm[b].y * H);
      ctx.stroke();
    });
    lm.forEach((pt) => {
      ctx.beginPath();
      ctx.arc((1 - pt.x) * W, pt.y * H, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#a855f7';
      ctx.fill();
    });
  }

  const recognizeDrawing = async (canvas) => {
    const allPoints = allStrokesRef.current.flatMap(s => s.points);
    if (allPoints.length < 8) {
      toast('Draw more before recognizing!', { icon: '✏️' });
      return;
    }
    setRecognizing(true);
    toast('🤖 AI is reading your drawing...', { icon: '✨', duration: 2000 });
    try {
      const { data } = await api.post('/air-draw/recognize-shape', {
        points: allPoints.map(([x, y]) => ({ x, y })),
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
      });
      setShapeResult(data.data);
      handleShapeAnimation(data.data.animationTrigger, data.data.emoji, data.data.message);
    } catch (err) {
      toast.error('Could not recognize shape. Try again!');
    } finally {
      setRecognizing(false);
    }
  };

  const handleShapeAnimation = (trigger, emoji, message) => {
    toast.success(`${emoji} ${message}`, { duration: 3500, style: { background: '#1a0530', color: '#fff', border: '1px solid #a855f7' } });
    
    window.dispatchEvent(new CustomEvent('aircanvas:shape', { detail: { trigger, emoji } }));
  };

  
  const startCanvas = async () => {
    setStartError('');
    if (!mediaPipeReady) {
      toast.error('MediaPipe is still loading. Please wait a moment.');
      return;
    }
    if (!window.Hands || !window.Camera) {
      toast.error('MediaPipe scripts not ready yet. Please refresh and try again.');
      return;
    }

    try {
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
      videoRef.current.srcObject = stream;
      await new Promise((resolve) => { videoRef.current.onloadedmetadata = resolve; });
      videoRef.current.play();

      
      drawCanvasRef.current.width  = 640;
      drawCanvasRef.current.height = 480;
      overlayRef.current.width     = 640;
      overlayRef.current.height    = 480;

      
      const hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`,
      });
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });
      hands.onResults((results) => {
        if (onHandResultsRef.current) onHandResultsRef.current(results);
      });
      handsRef.current = hands;

      
      const camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          try {
            if (handsRef.current && videoRef.current && videoRef.current.readyState >= 2) {
              await handsRef.current.send({ image: videoRef.current });
            }
          } catch (err) {
            
            
            if (!err.message?.includes('Aborted') && !err.message?.includes('SolutionWasm')) {
              console.warn('MediaPipe frame error:', err.message);
            }
          }
        },
        width: 640,
        height: 480,
      });
      camera.start();
      cameraRef.current = camera;

      setActive(true);
      toast.success('✋ Air Canvas ready! Index finger = draw. Pinch = AI recognize!', { duration: 4000 });
    } catch (err) {
      const msg = err.name === 'NotAllowedError'
        ? 'Camera permission denied. Please allow camera access and retry.'
        : `Could not start camera: ${err.message}`;
      setStartError(msg);
      toast.error(msg);
    }
  };

  
  const stopCanvas = () => {
    
    try { cameraRef.current?.stop(); } catch (_) {}
    cameraRef.current = null;

    
    try { handsRef.current?.close(); } catch (_) {}
    handsRef.current = null;

    const stream = videoRef.current?.srcObject;
    stream?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
    setGesture('none');
  };

  const clearAll = () => {
    const canvas = drawCanvasRef.current;
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    allStrokesRef.current = [];
    strokeRef.current = [];
    setShapeResult(null);
    if (socket) socket.emit('draw:air-clear', { roomId });
  };

  
  const manualRecognize = () => {
    const canvas = drawCanvasRef.current;
    if (canvas) recognizeDrawing(canvas);
  };

  
  useEffect(() => () => stopCanvas(), []);

  const gestureLabel = { draw: '✏️ Drawing', pinch: '🤏 Recognizing...', fist: '✊ Paused', none: '🖐️ Show index finger' }[gesture] || '';

  return (
    <div className="w-full space-y-4">
      {}
      {!mediaPipeReady && !mediaPipeError && (
        <div className="glass rounded-xl p-3 flex items-center gap-3 border border-white/10">
          <span className="w-3 h-3 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <span className="text-white/60 text-sm">Loading MediaPipe AI (one-time download ~5MB)...</span>
        </div>
      )}
      {mediaPipeError && (
        <div className="glass rounded-xl p-3 text-red-400 text-sm border border-red-500/30">
          ⚠️ MediaPipe failed to load. Check your internet connection and refresh.
        </div>
      )}

      {}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/60" style={{ paddingTop: '75%' }}>
        <div className="absolute inset-0">
          {}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)', opacity: active ? 0.18 : 0 }}
          />

          {}
          <canvas
            ref={drawCanvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ mixBlendMode: 'screen' }}
          />

          {}
          <canvas
            ref={overlayRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />

          {}
          {active && gesture !== 'none' && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-1.5 text-sm font-semibold text-white border border-white/10">
              {gestureLabel}
            </div>
          )}

          {}
          {collaborators > 0 && (
            <div className="absolute top-3 right-3 glass rounded-full px-3 py-1 text-xs text-white/70">
              👥 {collaborators + 1} drawing
            </div>
          )}

          {}
          <AnimatePresence>
            {recognizing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="text-5xl mb-3"
                >🤖</motion.div>
                <p className="text-white font-bold text-lg gradient-text">AI Reading Your Drawing...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {}
          {!active && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[#050510]/80">
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 2.2 }}
                className="text-7xl select-none"
              >✋</motion.div>
              <div className="text-center px-4">
                <p className="text-white font-bold text-lg">Air Drawing Canvas</p>
                <p className="text-white/50 text-sm mt-1">
                  Use your index finger to draw in the air.<br />
                  Click the AI Recognize button when you're done drawing!
                </p>
                {startError && <p className="text-red-400 text-xs mt-2">{startError}</p>}
              </div>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={startCanvas}
                disabled={!mediaPipeReady}
                className="px-7 py-3 rounded-full bg-gradient-to-r from-brand-500 to-neon-pink text-white font-bold text-base shadow-lg shadow-brand-500/40 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {mediaPipeReady ? '🎨 Start Air Drawing' : '⏳ Loading AI...'}
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {}
      <div className="flex flex-wrap items-center gap-3">
        {}
        <div className="flex gap-2 items-center">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              title={c}
              className={`w-7 h-7 rounded-full transition-all duration-150 ${
                color === c ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-transparent' : 'scale-100 opacity-70 hover:opacity-100'
              }`}
              style={{ background: c }}
            />
          ))}
        </div>

        {}
        <input
          type="range"
          min={4}
          max={20}
          value={strokeSize}
          onChange={e => setStrokeSize(Number(e.target.value))}
          className="w-24 accent-brand-500"
          title={`Stroke size: ${strokeSize}px`}
        />

        <div className="ml-auto flex gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={manualRecognize}
            disabled={recognizing || allStrokesRef.current.length === 0}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 text-white text-sm font-semibold disabled:opacity-40"
          >
            🤖 AI Recognize
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={clearAll}
            className="px-4 py-2 rounded-xl glass border border-white/10 text-white/70 hover:text-white text-sm"
          >
            🗑️ Clear
          </motion.button>
          {active && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={stopCanvas}
              className="px-4 py-2 rounded-xl glass border border-red-500/30 text-red-400 text-sm"
            >
              ⏹ Stop
            </motion.button>
          )}
        </div>
      </div>

      {}
      <div className="grid grid-cols-3 gap-2">
        {[
          { emoji: '☝️', name: 'Index Up', action: 'Draw freely' },
          { emoji: '🤏', name: 'Pinch', action: 'Stop current stroke' },
          { emoji: '✊', name: 'Fist', action: 'Pause drawing' },
        ].map(g => (
          <div key={g.name} className="glass rounded-xl p-3 text-center border border-white/5">
            <div className="text-xl mb-1">{g.emoji}</div>
            <div className="text-xs font-bold text-white/70">{g.name}</div>
            <div className="text-xs text-brand-400 mt-0.5">{g.action}</div>
          </div>
        ))}
      </div>

      {}
      <AnimatePresence>
        {shapeResult && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="glass rounded-2xl p-5 border border-brand-500/30"
          >
            <div className="flex items-start gap-4">
              <span className="text-5xl">{shapeResult.emoji}</span>
              <div className="flex-1">
                <h4 className="text-white font-bold text-xl gradient-text capitalize">{shapeResult.shape} detected!</h4>
                <p className="text-white/60 text-sm mt-1">{shapeResult.message}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(shapeResult.confidence * 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-neon-pink"
                    />
                  </div>
                  <span className="text-xs text-white/50 min-w-max">{Math.round(shapeResult.confidence * 100)}% confidence</span>
                </div>
              </div>
              <button onClick={() => setShapeResult(null)} className="text-white/30 hover:text-white/70 text-lg leading-none">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
