import { Suspense, lazy } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';
import CustomCursor from './components/CustomCursor';
import MusicPlayer from './components/MusicPlayer';

const CosmicBackground = lazy(() => import('./components/CosmicBackground'));
const PortalPage = lazy(() => import('./pages/PortalPage'));

function App() {
  return (
    <ErrorBoundary>
      <LoadingScreen />
      <CustomCursor />
      <Suspense fallback={null}>
        <CosmicBackground />
      </Suspense>
      <Suspense fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="loading-orb" style={{ width: 40, height: 40 }} />
        </div>
      }>
        <PortalPage />
      </Suspense>
      <MusicPlayer />
    </ErrorBoundary>
  );
}

export default App;
