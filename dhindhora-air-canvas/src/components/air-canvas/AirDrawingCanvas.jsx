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

const COLORS = ['#E63946', '#457B9D', '#F4A261', '#F1FAEE', '#2A9D8F'];

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
  const colorRef       = useRef('#E63946');
  const strokeSizeRef  = useRef(8);
  const onHandResultsRef = useRef(null);

  
  const [active, setActive]             = useState(false);
  const [color, setColor]               = useState('#E63946');
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
      octx.strokeStyle = '#F4A261';
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
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
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
      ctx.fillStyle = '#E63946';
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
    toast('🤖 AI is analyzing your sketch...', { icon: '✨' });
    try {
      const { data } = await api.post('/air-draw/recognize-shape', {
        points: allPoints.map(([x, y]) => ({ x, y })),
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
      });
      console.log('✅ AI Recognition Result:', data);
      setShapeResult(data.data);
      handleShapeAnimation(data.data.animationTrigger, data.data.emoji, data.data.message);
    } catch (err) {
      console.error('❌ AI Recognition Error:', err);
      toast.error('Could not recognize shape. Try again!');
    } finally {
      setRecognizing(false);
    }
  };

  const handleShapeAnimation = (trigger, emoji, message) => {
    toast.success(`${emoji} ${message}`, { style: { background: 'var(--bau-blue)', color: '#fff' } });
    
    window.dispatchEvent(new CustomEvent('aircanvas:shape', { detail: { trigger, emoji } }));
  };

  
  const startCanvas = async () => {
    setStartError('');
    if (!mediaPipeReady) {
      toast.error('MediaPipe is still loading. Please wait.');
      return;
    }
    if (!window.Hands || !window.Camera) {
      toast.error('MediaPipe not ready. Please refresh.');
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
      toast.success('System Online. Use Index Finger to draw.');
    } catch (err) {
      const msg = err.name === 'NotAllowedError'
        ? 'Camera permission denied.'
        : `Camera error: ${err.message}`;
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

  const gestureLabel = { draw: 'DRAWING', pinch: 'RECOGNIZING', fist: 'PAUSED', none: 'IDLE' }[gesture] || '';

  return (
    <div className="w-full h-full flex flex-col absolute inset-0">
      
      {/* ─── Canvas Container ─── */}
      <div className={`canvas-container flex-1 transition-all duration-300 ${active ? 'border-accent-red shadow-[0_0_20px_rgba(230,57,70,0.2)]' : 'border-white/10'}`}>
        <video ref={videoRef} autoPlay muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)', opacity: active ? 0.2 : 0 }} />
        <canvas ref={drawCanvasRef} className="absolute inset-0 w-full h-full object-contain pointer-events-none" style={{ mixBlendMode: 'screen' }} />
        <canvas ref={overlayRef} className="absolute inset-0 w-full h-full object-contain pointer-events-none" />

        {/* State UI Overlays */}
        {active && gesture !== 'none' && (
          <div className="absolute top-4 left-4 z-20 bg-black/80 border border-white/20 px-3 py-1 flex items-center gap-2">
            <span className={`w-2 h-2 ${gesture === 'draw' ? 'bg-accent-red animate-pulse' : gesture === 'pinch' ? 'bg-accent-blue' : 'bg-accent-yellow'}`} />
            <span className="text-white font-mono text-xs tracking-widest uppercase">{gestureLabel}</span>
          </div>
        )}

        {collaborators > 0 && (
          <div className="absolute top-4 right-4 z-20 bg-black/80 border border-white/20 px-3 py-1 font-mono text-xs text-white/70">
            <span className="text-accent-yellow mr-2">■</span>
            {collaborators + 1} ONLINE
          </div>
        )}

        {/* Inactive State Overlay */}
        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 p-4 text-center">
            <div className="w-16 h-16 border-2 border-accent-red flex items-center justify-center mb-6">
              <span className="text-3xl">✋</span>
            </div>
            <h2 className="font-display font-bold text-xl uppercase mb-2">Initialize Canvas</h2>
            <p className="font-mono text-sm text-white/50 mb-8 max-w-sm">System requires camera access to track hand movements. No data is stored.</p>
            {startError && <p className="text-accent-red text-xs mb-4 font-mono border border-accent-red/20 p-2 bg-accent-red/10">{startError}</p>}
            
            <button 
              onClick={startCanvas} 
              disabled={!mediaPipeReady}
              className="bauhaus-button btn-primary"
            >
              {mediaPipeReady ? 'Start Tracking' : 'Booting AI...'}
            </button>
          </div>
        )}

        {/* Recognition Overlay */}
        <AnimatePresence>
          {recognizing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-[60]">
              <div className="w-12 h-12 border-4 border-t-accent-red border-r-accent-blue border-b-accent-yellow border-l-transparent rounded-full animate-spin mb-4" />
              <p className="font-mono text-sm tracking-widest uppercase">Analyzing Pattern</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shape Result Overlay */}
        <AnimatePresence>
          {shapeResult && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="bauhaus-panel p-8 max-w-sm w-full border-t-4 border-t-accent-red">
                <div className="text-6xl mb-6 text-center">{shapeResult.emoji}</div>
                <h4 className="font-display font-bold text-2xl uppercase mb-2 text-center">{shapeResult.shape}</h4>
                <p className="font-mono text-xs text-white/60 mb-6 text-center">"{shapeResult.message}"</p>
                
                <div className="mb-6">
                  <div className="flex justify-between font-mono text-[10px] mb-1">
                    <span>CONFIDENCE</span>
                    <span>{Math.round(shapeResult.confidence * 100)}%</span>
                  </div>
                  <div className="h-1 bg-white/10 w-full">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${shapeResult.confidence * 100}%` }} 
                      className="h-full bg-accent-blue" 
                    />
                  </div>
                </div>
                
                <button onClick={() => setShapeResult(null)} className="bauhaus-button btn-secondary w-full">
                  Resume Drawing
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Bottom Toolbar ─── */}
      <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 border border-white/10 bg-black/60 relative z-20">
        
        {/* Colors */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="font-mono text-[10px] text-white/40 mr-2 uppercase tracking-widest">Color</div>
          {COLORS.map((c) => (
            <button key={c} onClick={() => setColor(c)} 
              className={`color-swatch ${color === c ? 'active' : ''}`}
              style={{ backgroundColor: c, borderColor: color === c ? 'white' : 'transparent' }} 
            />
          ))}
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-4 flex-1 sm:px-6 sm:border-l sm:border-r border-white/10 my-2 sm:my-0">
          <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest min-w-[60px]">Size {strokeSize}</div>
          <input type="range" min={4} max={20} value={strokeSize}
            onChange={e => setStrokeSize(Number(e.target.value))}
            className="size-slider" />
        </div>

        {/* Actions */}
        <div className="flex gap-2 sm:ml-auto">
          <button 
            onClick={manualRecognize}
            disabled={recognizing || allStrokesRef.current.length === 0}
            className="bauhaus-button btn-secondary text-[10px] px-3 py-2"
          >
            AI Parse
          </button>
          <button onClick={clearAll} className="bauhaus-button btn-secondary text-[10px] px-3 py-2 border-accent-red text-accent-red hover:bg-accent-red hover:text-white">
            Clear
          </button>
          {active && (
            <button onClick={stopCanvas} className="bauhaus-button btn-secondary text-[10px] px-3 py-2 opacity-50 hover:opacity-100">
              Stop
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
