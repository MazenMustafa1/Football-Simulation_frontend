'use client';

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useParams, notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import useSignalREventStream from '@/hooks/useSignalREventStream';
import signalRService from '@/Services/SignalRService';
import './simulationView.css'; // Ensure this file exists for styling

// Dynamic imports for heavy 3D components to enable code splitting
const Canvas = dynamic(
  () => import('@react-three/fiber').then((mod) => ({ default: mod.Canvas })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="text-xl text-white">Loading 3D Scene...</div>
      </div>
    ),
  }
);

const OrbitControls = dynamic(
  () =>
    import('@react-three/drei').then((mod) => ({ default: mod.OrbitControls })),
  {
    ssr: false,
  }
);

const Field = dynamic(() => import('@/components/Field'), {
  ssr: false,
});

const EventPlotter = dynamic(() => import('@/components/EventPlotter'), {
  ssr: false,
});

// Optimized components for better performance
const OptimizedBackground = dynamic(
  () => import('@/components/OptimizedBackground'),
  {
    ssr: false,
    loading: () => (
      <div style={{ background: '#0a0a0a', position: 'absolute', inset: 0 }} />
    ),
  }
);

const Scene3D = dynamic(() => import('@/components/Scene3D'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-white">
      Loading 3D Scene...
    </div>
  ),
});

export default function SimulationView() {
  const params = useParams();
  const [timer, setTimer] = useState(0);
  const [matchId, setMatchId] = useState<number>(0);
  const [isValidSimulation, setIsValidSimulation] = useState<boolean | null>(
    null
  );

  // Get simulationId from route params
  const routeSimulationId = params.simulationId as string;

  // Validate simulation ID and get matchId from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const matchIdStr = localStorage.getItem('matchId') || '';
      const storedSimulationId = localStorage.getItem('simulationId') || '';

      console.log('[SimulationView] Route simulation ID:', routeSimulationId);
      console.log('[SimulationView] Stored simulation ID:', storedSimulationId);

      // Check if route simulationId matches stored simulationId
      if (
        !routeSimulationId ||
        !storedSimulationId ||
        routeSimulationId !== storedSimulationId
      ) {
        console.warn('[SimulationView] Simulation ID mismatch or missing:', {
          route: routeSimulationId,
          stored: storedSimulationId,
        });
        setIsValidSimulation(false);
        return;
      }

      // If IDs match, proceed with matchId setup
      const parsedMatchId = matchIdStr ? parseInt(matchIdStr, 10) : 0;
      setMatchId(parsedMatchId);
      setIsValidSimulation(true);

      console.log(
        `[SimulationView] Retrieved matchId from localStorage: "${matchIdStr}" -> ${parsedMatchId}`
      );
      console.log(`[SimulationView] matchId is valid: ${parsedMatchId > 0}`);
    }
  }, [routeSimulationId]);

  // Trigger 404 if simulation is invalid
  useEffect(() => {
    if (isValidSimulation === false) {
      notFound();
    }
  }, [isValidSimulation]);

  const { events, isConnected, retryCount } = useSignalREventStream(matchId);

  // Debug effect to track events changes in SimulationView
  useEffect(() => {
    console.log(
      `🎪🎪🎪 [SimulationView] EVENTS ARRAY CHANGED - Count: ${events.length}`
    );
  }, [events]);

  // Timer logic - synchronized across the app
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Memoize debug functions to prevent unnecessary re-renders
  const debugFunctions = useMemo(
    () => ({
      testConnection: async () => {
        console.log('[SimulationView] Testing SignalR connection...');
        const stats = signalRService.getConnectionStats();
        console.log('[SimulationView] Connection stats:', stats);

        if (!isConnected) {
          console.log(
            '[SimulationView] Not connected, attempting to connect...'
          );
          const connected = await signalRService.connectMatchSimulation();
          console.log(
            `[SimulationView] Connection attempt result: ${connected}`
          );
        }
      },

      forceReconnect: async () => {
        console.log('[SimulationView] Forcing reconnect...');
        await signalRService.resetConnection();
      },

      debugSignalR: () => {
        console.log('🔍🔍🔍 [SimulationView] === SIGNALR DEBUG INFO ===');
        console.log('Match ID:', matchId);
        console.log('Is Connected:', isConnected);
        console.log('Events Count:', events.length);
        console.log('Connection Stats:', signalRService.getConnectionStats());
      },
    }),
    [matchId, isConnected, events.length]
  );

  // Show loading state while validating simulation ID
  if (isValidSimulation === null) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
        }}
      >
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚽</div>
          <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>
            Loading Simulation
          </h2>
          <p style={{ fontSize: '16px', opacity: 0.7 }}>
            Validating simulation access...
          </p>
          <div style={{ marginTop: '20px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '4px solid rgba(255,255,255,0.3)',
                borderTop: '4px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto',
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Optimized Background Component */}
      <Suspense
        fallback={
          <div
            style={{ background: '#0a0a0a', position: 'absolute', inset: 0 }}
          />
        }
      >
        <OptimizedBackground />
      </Suspense>

      {/* 3D Canvas */}
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center text-xl text-white">
            Loading 3D Scene...
          </div>
        }
      >
        <Canvas
          shadows
          camera={{ position: [0, 45, 115], fov: 50, near: 0.1, far: 1000 }}
          style={{ zIndex: 2 }}
          gl={{
            antialias: false, // Disable for better performance
            powerPreference: 'high-performance',
          }}
        >
          <Scene3D events={events} timer={timer} />
        </Canvas>
      </Suspense>

      {/* Debug Panel */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          fontSize: '14px',
          fontWeight: 'bold',
          color: 'white',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '15px',
          borderRadius: '8px',
          zIndex: 10,
          fontFamily: 'monospace',
          lineHeight: '1.4',
        }}
      >
        <div
          style={{ marginBottom: '10px', fontSize: '16px', color: '#00ff00' }}
        >
          🔥 SignalR Debug Panel
        </div>{' '}
        <div>Match ID: {matchId || 'Not set'}</div>
        <div>
          Connection Status: {isConnected ? '✅ Connected' : '❌ Disconnected'}
        </div>
        <div>Retry Count: {retryCount || 0}/5</div>
        <div style={{ color: events.length > 0 ? '#00ff00' : '#ff6b6b' }}>
          Events Received: {events.length} {events.length > 0 ? '🎉' : '⏳'}
        </div>
        <div style={{ marginTop: '5px', fontSize: '11px', opacity: 0.8 }}>
          {events.length > 0 ? (
            <>
              <div>Latest: {events[events.length - 1]?.action || 'N/A'}</div>
              <div>Player: {events[events.length - 1]?.player || 'N/A'}</div>
              <div>
                Time: {events[events.length - 1]?.minute || 0}:
                {events[events.length - 1]?.second || 0}
              </div>
            </>
          ) : (
            <div>Waiting for events...</div>
          )}
        </div>
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={debugFunctions.testConnection}
            style={{
              marginRight: '10px',
              padding: '5px 10px',
              fontSize: '12px',
              backgroundColor: '#007acc',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            Test Connection
          </button>
          <button
            onClick={debugFunctions.forceReconnect}
            style={{
              marginRight: '10px',
              padding: '5px 10px',
              fontSize: '12px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            Force Reconnect
          </button>
          <button
            onClick={debugFunctions.debugSignalR}
            style={{
              padding: '5px 10px',
              fontSize: '12px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            Debug Info
          </button>
        </div>
      </div>

      {/* Timer display */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '32px',
          fontWeight: 'bold',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '10px',
          zIndex: 10,
        }}
      >
        {/* ⏱ {formatTime(timer)} */}
      </div>
    </div>
  );
}
