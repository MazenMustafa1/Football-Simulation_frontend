'use client';

import { useGLTF } from '@react-three/drei';
import { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Event } from '@/types/Event';
import {
  renderPassEvent,
  renderShotEvent,
  renderFoulEvent,
  renderMatchStartEvent,
  renderBallReceiptEvent,
  renderCarryEvent,
  renderPressureEvent,
  renderThrowInPassEvent,
  renderCardEvent,
  renderSaveEvent,
  ScoreboardDisplay,
} from './plotters/eventPlottingHandlers';
import {
  getTeamNameWithFallback,
  storeTeamNames,
  storeScores,
  getStoredScores,
  storeMatchTime,
  getStoredMatchTime,
  STORAGE_KEYS,
} from '@/lib/teamStorage';

// Add props interface
interface EventPlotterProps {
  events: Event[];
  timer: number;
}

const getFirstGoalkeeperNames = (events: Event[]) => {
  const keeperMap: Record<string, string> = {};
  for (const event of events) {
    if (
      event.player &&
      event.team &&
      event.player.toLowerCase().includes('goal keeper') &&
      !keeperMap[event.team]
    ) {
      keeperMap[event.team] = event.player;
    }
  }
  return keeperMap;
};

const normalizeGoalkeeperName = (
  event: Event,
  keeperMap: Record<string, string>
): Event => {
  if (
    event.player &&
    event.team &&
    event.player.toLowerCase().includes('goal keeper') &&
    keeperMap[event.team]
  ) {
    // Remove "goal keeper" (case-insensitive) from the name, trim spaces
    const cleanName = keeperMap[event.team]
      .replace(/goal keeper\s*/i, '')
      .trim();
    return { ...event, player: cleanName };
  }
  return event;
};

const EventPlotter = ({ events, timer }: EventPlotterProps) => {
  const ballRef = useRef<THREE.Mesh>(null);

  // Extract home/away team names from the first match_start event
  const matchStartEvent = events.find((e) => e.event_type === 'match_start');

  const homeTeam = getTeamNameWithFallback(
    matchStartEvent?.home_team,
    STORAGE_KEYS.HOME_TEAM,
    'Home Team'
  );
  const awayTeam = getTeamNameWithFallback(
    matchStartEvent?.away_team,
    STORAGE_KEYS.AWAY_TEAM,
    'Away Team'
  );

  // Debug log for team names
  useEffect(() => {
    console.log(
      `[EventPlotter] Team names - Home: ${homeTeam}, Away: ${awayTeam}`
    );
    console.log(
      `[EventPlotter] From event:`,
      matchStartEvent?.home_team,
      matchStartEvent?.away_team
    );
    if (typeof window !== 'undefined') {
      console.log(
        `[EventPlotter] From localStorage:`,
        localStorage.getItem('homeTeamName'),
        localStorage.getItem('awayTeamName')
      );
    }
  }, [homeTeam, awayTeam, matchStartEvent]);

  const processedGoals = useRef(new Set<string>());

  // Scoreboard state - initialize from localStorage if available
  const [homeScore, setHomeScore] = useState(() => {
    const stored = getStoredScores();
    return stored.homeScore;
  });
  const [awayScore, setAwayScore] = useState(() => {
    const stored = getStoredScores();
    return stored.awayScore;
  });
  const { scene } = useGLTF('/models/soccer_ball.glb');

  // Store team names in localStorage when they become available from events
  useEffect(() => {
    if (matchStartEvent?.home_team && matchStartEvent?.away_team) {
      storeTeamNames(matchStartEvent.home_team, matchStartEvent.away_team);
    }
  }, [matchStartEvent]);

  // Store scores in localStorage whenever they change
  useEffect(() => {
    storeScores(homeScore, awayScore);
  }, [homeScore, awayScore]);

  // Handle goal detection from events
  useEffect(() => {
    const goalEvents = events.filter(
      (event) => event.event_type === 'shot' && event.outcome === 'Goal'
    );

    goalEvents.forEach((goalEvent) => {
      const goalId = `${goalEvent.team}-${goalEvent.timestamp || goalEvent.event_index}`;

      if (!processedGoals.current.has(goalId)) {
        processedGoals.current.add(goalId);

        if (goalEvent.team === homeTeam) {
          setHomeScore((prev) => prev + 1);
        } else if (goalEvent.team === awayTeam) {
          setAwayScore((prev) => prev + 1);
        }
      }
    });
  }, [events, homeTeam, awayTeam]);

  const moveBall = (pos: [number, number, number]) => {
    if (ballRef.current) {
      ballRef.current.position.set(pos[0], pos[1], pos[2]);
    }
  };

  // --- NEW: Normalize goalkeeper names dynamically ---
  const keeperMap = getFirstGoalkeeperNames(events);
  const normalizedEvents = events.map((e) =>
    normalizeGoalkeeperName(e, keeperMap)
  );

  const allowedTypes = [
    'match_start',
    'pass',
    'ball_receipt',
    'carry',
    'pressure',
    'duel',
    'interception',
    'block',
    'throw_in_pass',
    'foul_committed',
    'foul_won',
    'free_kick_pass',
    'dribble',
    'ball_recovery',
    'shot',
    'save',
    'corner_pass',
    'goal_kick_pass',
    'match_end',
    'first_half_end',
    'second_half_start',
  ] as const;

  // Track sent-off players
  const sentOffPlayers = new Set<string>();
  const filteredEvents: Event[] = [];

  for (const event of normalizedEvents) {
    // If this player has been sent off, skip their events
    if (event.player && sentOffPlayers.has(event.player)) continue;

    // If this event is a red card or second yellow, add player to sent-off list
    if (
      event.event_type === 'foul_committed' &&
      (event.card === 'Red Card' || event.card === 'Second Yellow') &&
      event.player
    ) {
      sentOffPlayers.add(event.player);
    }

    filteredEvents.push(event);
  }

  // Only show the last 5 relevant events
  const visibleEvents = filteredEvents
    .filter((event) =>
      allowedTypes.includes(event.event_type as (typeof allowedTypes)[number])
    )
    .slice(-5);

  const renderEvent = (event: Event, key: number) => {
    switch (event?.event_type) {
      case 'match_start':
        return <group key={key}>{renderMatchStartEvent(event)}</group>;
      case 'pass':
      case 'free_kick_pass':
      case 'corner_pass':
        return (
          <group key={key}>
            {renderPassEvent(event, moveBall, homeTeam, awayTeam)}
          </group>
        );
      case 'ball_receipt':
      case 'ball_recovery':
        return (
          <group key={key}>
            {renderBallReceiptEvent(event, moveBall, homeTeam, awayTeam)}
          </group>
        );
      case 'carry':
      case 'interception':
      case 'block':
      case 'foul_won':
      case 'dribble':
        return (
          <group key={key}>
            {renderCarryEvent(event, moveBall, homeTeam, awayTeam)}
          </group>
        );
      case 'pressure':
      case 'duel':
        return (
          <group key={key}>
            {renderPressureEvent(event, homeTeam, awayTeam)}
          </group>
        );
      case 'foul_committed':
        return (
          <group key={key}>{renderFoulEvent(event, homeTeam, awayTeam)}</group>
        );
      case 'throw_in_pass':
        return (
          <group key={key}>
            {renderThrowInPassEvent(event, moveBall, homeTeam, awayTeam)}
          </group>
        );
      case 'shot':
        return (
          <group key={key}>
            {renderShotEvent(event, moveBall, homeTeam, awayTeam)}
          </group>
        );
      case 'save':
        return (
          <group key={key}>
            {renderSaveEvent(event, moveBall, homeTeam, awayTeam)}
          </group>
        );
      default:
        return null;
    }
  };

  // Calculate actual match time from the latest event (instead of using incrementing timer)
  const currentMatchTime = useMemo(() => {
    if (events.length === 0) {
      // If no events, try to get stored match time as fallback
      return getStoredMatchTime();
    }

    // Get the latest event with time information
    const latestEvent = events[events.length - 1];

    // Use time_seconds directly - this is the most accurate
    if (latestEvent?.time_seconds !== undefined) {
      const matchTime = latestEvent.time_seconds;
      // Store the current match time for persistence
      storeMatchTime(matchTime);
      return matchTime;
    }

    // If no time_seconds, fallback to stored time or incrementing timer
    return getStoredMatchTime() || timer;
  }, [events, timer]);

  // Debug log for match time changes
  useEffect(() => {
    if (events.length > 0) {
      const latestEvent = events[events.length - 1];
      console.log(`[EventPlotter] Match time update:`, {
        currentMatchTime,
        eventTimeSeconds: latestEvent?.time_seconds,
        eventsCount: events.length,
      });
    }
  }, [currentMatchTime, events]);

  return (
    <group>
      {/* Ball */}
      <primitive
        ref={ballRef}
        object={scene}
        position={[0, 0, 0]}
        scale={[2, 2, 2]}
      />

      {/* 3D Scoreboard */}
      <ScoreboardDisplay
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        homeScore={homeScore}
        awayScore={awayScore}
        timer={currentMatchTime}
      />

      {/* Only render the last 5 events */}
      {visibleEvents.map((event) => renderEvent(event, event.event_index))}
    </group>
  );
};

export default EventPlotter;
