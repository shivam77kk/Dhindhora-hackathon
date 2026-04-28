import React, { Suspense, useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import ArtStudioBackground from './components/three/ArtStudioBackground';
import './App.css';

const PhotoBooth = React.lazy(() => import('./components/photobooth/PhotoBooth'));

export default function App() {
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const updateCursor = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    const handleMouseDown = () => setIsDrawing(true);
    const handleMouseUp = () => setIsDrawing(false);

    window.addEventListener('mousemove', updateCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', updateCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            color: '#111827', // Stronger dark gray
            border: '2px solid rgba(255, 46, 147, 0.5)', // Slightly thicker border
            borderRadius: '16px',
            fontSize: '15px',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 10px 25px rgba(255, 46, 147, 0.15)',
            maxWidth: '500px', // Prevent massive toasts
            wordBreak: 'break-word', // Ensure long error strings wrap nicely
            fontWeight: '600'
          },
        }}
      />
      
      {/* Magic Brush Cursor Effect */}
      <div 
        className="magic-brush-trail"
        style={{
          left: cursorPos.x - 20,
          top: cursorPos.y - 20,
          width: isDrawing ? '60px' : '40px',
          height: isDrawing ? '60px' : '40px',
          background: 'radial-gradient(circle, rgba(0,240,255,0.4) 0%, rgba(255,46,147,0.3) 40%, transparent 70%)',
          transition: 'width 0.2s, height 0.2s',
        }}
      />

      <ArtStudioBackground />

      <main className="min-h-screen relative overflow-y-auto overflow-x-hidden pt-12 pb-20">
        <div className="relative z-10 px-4 max-w-6xl mx-auto flex flex-col items-center">
          
          <div className="text-center mb-10 mt-6 max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-display font-black text-gradient-vibrant mb-6 tracking-tight drop-shadow-md">
              Artistic Studio
            </h1>
            <p className="text-gray-800 text-lg md:text-2xl font-sans font-medium leading-relaxed drop-shadow-sm">
              Step into the canvas. Capture a moment and let AI transform it into a masterpiece using vivid, dynamic art styles.
            </p>
          </div>
          
          <Suspense fallback={
            <div className="studio-glass rounded-3xl p-16 text-center text-gray-500 animate-pulse w-full max-w-3xl">
              <div className="text-5xl mb-4">🎨</div>
              <p className="font-display text-xl tracking-wide">Preparing your digital canvas...</p>
            </div>
          }>
            <PhotoBooth />
          </Suspense>
        </div>
      </main>
    </>
  );
}
