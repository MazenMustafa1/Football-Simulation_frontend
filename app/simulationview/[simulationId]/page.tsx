'use client';

import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Field from '@/components/Field';
import useSignalREventStream from '@/hooks/useSignalREventStream';
import EventPlotter from '@/components/EventPlotter';
import signalRService from '@/Services/SignalRService';
import './simulationView.css'; // Ensure this file exists for styling

export default function SimulationView() {
  const [timer, setTimer] = useState(0);
  const [matchId, setMatchId] = useState<number>(0);

  // Get matchId from localStorage (set when simulation is started) - CLIENT SIDE ONLY
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const matchIdStr = localStorage.getItem('matchId') || '';
      const parsedMatchId = matchIdStr ? parseInt(matchIdStr, 10) : 0;
      setMatchId(parsedMatchId);
      console.log(
        `[SimulationView] Retrieved matchId from localStorage: "${matchIdStr}" -> ${parsedMatchId}`
      );
      console.log(`[SimulationView] matchId is valid: ${parsedMatchId > 0}`);
    }
  }, []);

  const { events, isConnected, retryCount } = useSignalREventStream(matchId);

  console.log(
    `[SimulationView] Current state - events: ${events.length}, isConnected: ${isConnected}, retries: ${retryCount}`
  );

  // Debug effect to track events changes in SimulationView
  useEffect(() => {
    console.log(
      `🎪🎪🎪 [SimulationView] EVENTS ARRAY CHANGED - Count: ${events.length}`
    );
    if (events.length > 0) {
      console.log(
        `🎪 [SimulationView] Latest event in view:`,
        events[events.length - 1]
      );
      console.log(`🎪 [SimulationView] All events in view:`, events);
    } else {
      console.log(`🎪 [SimulationView] No events yet in view`);
    }
  }, [events]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Log all localStorage items for debugging
      console.log('[SimulationView] All localStorage items:');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          console.log(`  ${key}: ${value}`);
        }
      }

      // Check if we have a valid matchId
      if (!matchId || matchId <= 0) {
        console.warn(
          '[SimulationView] No valid matchId found in localStorage. Please start a simulation first.'
        );
      } else {
        console.log(`[SimulationView] Using matchId: ${matchId}`);
      }
    }
  }, [matchId]);

  const testConnection = async () => {
    console.log('[SimulationView] Testing SignalR connection...');
    const stats = signalRService.getConnectionStats();
    console.log('[SimulationView] Connection stats:', stats);

    if (!isConnected) {
      console.log('[SimulationView] Not connected, attempting to connect...');
      const connected = await signalRService.connectMatchSimulation();
      console.log(`[SimulationView] Connection attempt result: ${connected}`);
    }
  };
  const forceReconnect = async () => {
    console.log('[SimulationView] Forcing reconnect...');
    await signalRService.resetConnection();
  };

  const debugSignalR = () => {
    console.log('🔍🔍🔍 [SimulationView] === SIGNALR DEBUG INFO ===');
    console.log('Match ID:', matchId);
    console.log('Is Connected:', isConnected);
    console.log('Retry Count:', retryCount);
    console.log('Events Count:', events.length);
    console.log('Events Array:', events);
    console.log('Connection Stats:', signalRService.getConnectionStats());
    console.log(
      'Connection State:',
      signalRService.getMatchSimulationConnectionState()
    );

    // Test if we can manually trigger event logging
    console.log('🧪 Testing event logging...');

    // Log all SignalR connection details
    const connectionStats = signalRService.getConnectionStats();
    console.log(
      'Full connection stats:',
      JSON.stringify(connectionStats, null, 2)
    );
  }; // Timer logic - synchronized across the app
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
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        // Beautiful black to darker blue gradient - lighter version
        background: `
                    radial-gradient(ellipse at top, 
                        rgba(12, 20, 50, 0.5) 0%, 
                        rgba(8, 12, 30, 0.9) 40%, 
                        rgba(2, 2, 8, 1) 80%
                    ),
                    linear-gradient(135deg, 
                        #0a0a0a 0%, 
                        #0f1420 20%, 
                        #141b2a 40%, 
                        #1a2238 60%, 
                        #0a0a0a 100%
                    ),
                    linear-gradient(to bottom, 
                        rgba(5, 5, 5, 0.3) 0%, 
                        rgba(2, 2, 8, 0.7) 60%, 
                        rgba(0, 0, 0, 1) 100%
                    )
                `,
        overflow: 'hidden',
      }}
    >
      {/* Subtle atmospheric glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
                        radial-gradient(ellipse 60% 40% at 50% 20%, 
                            rgba(20, 45, 85, 0.08) 0%, 
                            transparent 70%
                        ),
                        radial-gradient(ellipse 80% 60% at 30% 80%, 
                            rgba(12, 25, 55, 0.06) 0%, 
                            transparent 60%
                        ),
                        radial-gradient(ellipse 80% 60% at 70% 80%, 
                            rgba(12, 25, 55, 0.06) 0%, 
                            transparent 60%
                        )
                    `,
          animation: 'gentle-glow 12s ease-in-out infinite alternate',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* VERY SUBTLE scoreboard area lighting */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '35%',
          width: '30%',
          height: '25%',
          background: `
                        radial-gradient(ellipse 90% 80% at 50% 70%, 
                            rgba(255, 255, 255, 0.012) 0%, 
                            rgba(255, 255, 255, 0.005) 60%, 
                            transparent 100%
                        )
                    `,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Background dot pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
                        radial-gradient(1px 1px at 8% 15%, rgba(255, 255, 255, 0.3), transparent),
                        radial-gradient(2px 2px at 22% 25%, rgba(255, 255, 255, 0.2), transparent),
                        radial-gradient(1px 1px at 45% 12%, rgba(255, 255, 255, 0.25), transparent),
                        radial-gradient(1px 1px at 65% 28%, rgba(255, 255, 255, 0.2), transparent),
                        radial-gradient(2px 2px at 78% 18%, rgba(255, 255, 255, 0.15), transparent),
                        radial-gradient(1px 1px at 92% 35%, rgba(255, 255, 255, 0.3), transparent),
                        radial-gradient(1px 1px at 15% 45%, rgba(255, 255, 255, 0.2), transparent),
                        radial-gradient(2px 2px at 38% 55%, rgba(255, 255, 255, 0.25), transparent),
                        radial-gradient(1px 1px at 58% 42%, rgba(255, 255, 255, 0.2), transparent),
                        radial-gradient(1px 1px at 82% 58%, rgba(255, 255, 255, 0.15), transparent),
                        radial-gradient(2px 2px at 5% 72%, rgba(255, 255, 255, 0.3), transparent),
                        radial-gradient(1px 1px at 28% 78%, rgba(255, 255, 255, 0.2), transparent),
                        radial-gradient(1px 1px at 52% 68%, rgba(255, 255, 255, 0.25), transparent),
                        radial-gradient(2px 2px at 75% 82%, rgba(255, 255, 255, 0.15), transparent),
                        radial-gradient(1px 1px at 88% 75%, rgba(255, 255, 255, 0.2), transparent)
                    `,
          backgroundSize: '150px 150px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Elegant light beams */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
                        linear-gradient(45deg, 
                            transparent 40%, 
                            rgba(20, 45, 85, 0.04) 50%, 
                            transparent 60%
                        ),
                        linear-gradient(-45deg, 
                            transparent 40%, 
                            rgba(12, 25, 55, 0.04) 50%, 
                            transparent 60%
                        )
                    `,
          animation: 'subtle-rays 15s ease-in-out infinite alternate',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Static starfield effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
                        radial-gradient(1px 1px at 20% 30%, rgba(255, 255, 255, 0.6), transparent),
                        radial-gradient(1px 1px at 40% 60%, rgba(255, 255, 255, 0.4), transparent),
                        radial-gradient(2px 2px at 60% 20%, rgba(20, 45, 85, 0.3), transparent),
                        radial-gradient(1px 1px at 80% 70%, rgba(255, 255, 255, 0.5), transparent),
                        radial-gradient(1px 1px at 10% 80%, rgba(255, 255, 255, 0.3), transparent),
                        radial-gradient(2px 2px at 90% 40%, rgba(12, 25, 55, 0.2), transparent),
                        radial-gradient(1px 1px at 70% 10%, rgba(255, 255, 255, 0.4), transparent)
                    `,
          backgroundSize:
            '300px 300px, 400px 400px, 200px 200px, 350px 350px, 450px 450px, 250px 250px, 500px 500px',
          animation: 'twinkle-stars 8s ease-in-out infinite alternate',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Stronger vignette for darker edges */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
                        radial-gradient(ellipse 80% 60% at 50% 40%, 
                            transparent 0%, 
                            transparent 40%, 
                            rgba(0, 0, 0, 0.3) 70%, 
                            rgba(0, 0, 0, 0.7) 100%
                        )
                    `,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Extra dark bottom overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: `
                        linear-gradient(to top, 
                            rgba(0, 0, 0, 0.7) 0%, 
                            rgba(0, 0, 0, 0.3) 50%, 
                            transparent 100%
                        )
                    `,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Dark side borders */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '15%',
          height: '100%',
          background: `
                        linear-gradient(to right, 
                            rgba(0, 0, 0, 0.5) 0%, 
                            rgba(0, 0, 0, 0.2) 70%, 
                            transparent 100%
                        )
                    `,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '15%',
          height: '100%',
          background: `
                        linear-gradient(to left, 
                            rgba(0, 0, 0, 0.5) 0%, 
                            rgba(0, 0, 0, 0.2) 70%, 
                            transparent 100%
                        )
                    `,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <Canvas
        shadows
        camera={{ position: [0, 45, 115], fov: 50, near: 0.1, far: 1000 }}
        style={{ zIndex: 2 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
        <OrbitControls />
        <Field />
        <EventPlotter events={events} timer={timer} />{' '}
        {/* ✅ Pass the SignalR events */}
      </Canvas>

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
            onClick={testConnection}
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
            onClick={forceReconnect}
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
            onClick={debugSignalR}
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
