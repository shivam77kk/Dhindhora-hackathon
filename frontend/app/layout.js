import './globals.css';
import { Toaster } from 'react-hot-toast';
import Providers from './providers';

export const metadata = {
  title: 'Dhindhora — Your Story. Amplified. | Black Clovers Dhindhora',
  description: 'Create immersive AI-powered weboreels with 1M star galaxies, AI music, live prediction markets, and cinematic portal transitions. Team Black Clovers Presents.',
  keywords: 'AI, webreel, hackathon, WebGPU, 3D, Gemini, prediction market, music generation',
};

import dynamic from 'next/dynamic';
const VoiceController = dynamic(() => import('@/components/voice/VoiceController'), { ssr: false });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-[#050510] text-white antialiased" suppressHydrationWarning>
        <Providers>
          {children}
          <VoiceController />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#0d0d2b',
                color: '#e2e8f0',
                border: '1px solid rgba(108,99,255,0.3)',
                backdropFilter: 'blur(20px)',
              },
              success: { iconTheme: { primary: '#10B981', secondary: '#050510' } },
              error: { iconTheme: { primary: '#EF4444', secondary: '#050510' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
