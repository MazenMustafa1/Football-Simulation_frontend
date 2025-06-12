'use client';

import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSettings } from '../../contexts/EnhancedSettingsContext';
import matchService, {
  LiveMatch,
  LiveMatchResponse,
} from '@/Services/MatchService';
import signalRService, { MatchStatistics } from '@/Services/SignalRService';
import authService from '@/Services/AuthenticationService';
import liveMatchStorageService from '@/Services/LiveMatchStorageService';

interface StatBarProps {
  leftValue: number;
  rightValue: number;
  label: string;
  leftColor: string;
  rightColor: string;
}

interface LiveMatchPanelProps {
  userId?: string;
  // Fallback props for when no live match is available
  homeTeam?: {
    name: string;
    logo: string;
  };
  awayTeam?: {
    name: string;
    logo: string;
  };
  homeScore?: number;
  awayScore?: number;
  stats?: Array<{
    label: string;
    homeValue: number;
    awayValue: number;
  }>;
  matchTime?: string;
}

const StatBar = ({
  leftValue,
  rightValue,
  label,
  leftColor,
  rightColor,
}: StatBarProps) => {
  const { isDarkMode } = useSettings();
  const total = leftValue + rightValue || 1;
  const leftPercent = (leftValue / total) * 100;
  const rightPercent = (rightValue / total) * 100;

  return (
    <div className="my-3 w-full text-xs">
      <div
        className={`mb-2 flex items-center justify-between px-2 font-medium ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}
      >
        <span className="font-semibold text-green-600">{leftValue}</span>
        <span
          className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
        >
          {label}
        </span>
        <span className="font-semibold text-blue-600">{rightValue}</span>
      </div>
      <div
        className={`relative flex h-2.5 w-full overflow-hidden rounded-full backdrop-blur-sm ${
          isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'
        }`}
      >
        <div
          className="rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${leftPercent}%`,
            background: `linear-gradient(90deg, ${leftColor}, ${leftColor}dd)`,
          }}
        />
        <div
          className="rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${rightPercent}%`,
            background: `linear-gradient(90deg, ${rightColor}dd, ${rightColor})`,
          }}
        />
        {/* Glassy overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/10 to-white/30"></div>
      </div>
    </div>
  );
};

export default function LiveMatchPanel({
  userId: propUserId,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  stats,
  matchTime,
}: LiveMatchPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [liveMatchData, setLiveMatchData] = useState<LiveMatch | null>(null);
  const [hasLiveMatch, setHasLiveMatch] = useState(false);
  const [error, setError] = useState<string>('');
  const [realtimeStatistics, setRealtimeStatistics] =
    useState<MatchStatistics | null>(null);
  const [signalRConnected, setSignalRConnected] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [updateCounter, setUpdateCounter] = useState(0); // Force re-render for time elapsed calculation
  const [viewportKey, setViewportKey] = useState(0); // Force re-render on viewport changes
  const router = useRouter();

  // Get dark mode from settings
  const { isDarkMode } = useSettings();

  // Main initialization effect - handles mounting, stored data loading, and resize events
  useEffect(() => {
    setIsMounted(true);

    // Load stored real-time statistics on mount
    const { statistics, updateTime } =
      liveMatchStorageService.getRealtimeStatistics();
    if (statistics && updateTime) {
      setRealtimeStatistics(statistics);
      setLastUpdateTime(updateTime);
    }

    // Listen for viewport changes to ensure consistent behavior across device sizes
    const handleResize = () => {
      setViewportKey((prev) => prev + 1);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Get user ID from authentication service or use prop
  const getUserId = (): string | null => {
    if (propUserId) {
      return propUserId;
    }

    const currentUser = authService.getCurrentUser();

    if (currentUser) {
      // Extract user ID from the nameidentifier claim (your JWT structure)
      const userId = currentUser.claimNameId || currentUser.sub;
      return userId;
    }

    return null;
  };

  const userId = getUserId();

  // SignalR connection and statistics listener effect
  useEffect(() => {
    let isSubscribed = true;

    const initSignalR = async () => {
      try {
        // Only connect if user is authenticated
        if (!authService.isAuthenticated()) {
          console.warn('User not authenticated, skipping SignalR connection');
          return;
        }

        const connected = await signalRService.connectMatchSimulation();
        if (isSubscribed) {
          setSignalRConnected(connected);
        }

        if (!connected) {
          console.error('Failed to connect SignalR');
        }
      } catch (error) {
        console.error('Failed to connect SignalR:', error);
        if (isSubscribed) {
          setSignalRConnected(false);
        }
      }
    };

    // Handle visibility change to maintain connection
    const handleVisibilityChange = () => {
      if (!document.hidden && signalRConnected && liveMatchData?.id) {
        // Tab became visible, ensure we're still in the match statistics group
        signalRService.joinMatchStatistics(liveMatchData.id).then((joined) => {
          if (!joined) {
            console.warn(
              'Failed to re-join match statistics group on tab focus'
            );
          }
        });
      }

      // When tab becomes visible, refresh from stored data if available
      if (!document.hidden && liveMatchData?.id) {
        const { statistics, updateTime } =
          liveMatchStorageService.getRealtimeStatistics();
        if (
          statistics &&
          updateTime &&
          liveMatchStorageService.isStoredStatisticsValid(liveMatchData.id)
        ) {
          if (isSubscribed) {
            setRealtimeStatistics(statistics);
            setLastUpdateTime(updateTime);
          }
        }
      }
    };

    initSignalR();

    // Listen for visibility changes to maintain connection
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isSubscribed = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Cleanup SignalR listeners on unmount
      if (signalRConnected && liveMatchData?.id) {
        signalRService.leaveMatchStatistics(liveMatchData.id);
      }
    };
  }, [signalRConnected, liveMatchData?.id]);

  // Set up real-time match statistics listener
  useEffect(() => {
    if (!signalRConnected || !liveMatchData?.id) {
      return;
    }

    // Join match statistics group
    signalRService.joinMatchStatistics(liveMatchData.id).then((joined) => {
      if (!joined) {
        console.error(
          'Failed to join match statistics group for match:',
          liveMatchData.id
        );
      }
    });

    // Listen for real-time match statistics updates
    signalRService.onMatchStatisticsUpdate(
      (method: string, matchId: number, statistics: MatchStatistics) => {
        if (matchId === liveMatchData.id) {
          // Update statistics and record when the update was received
          const now = new Date();
          setRealtimeStatistics(statistics);
          setLastUpdateTime(now);

          // Store complete real-time statistics for persistence
          liveMatchStorageService.setRealtimeStatistics(statistics, now);

          // Store match data using the storage service
          liveMatchStorageService.setLiveMatchData({
            matchId: matchId,
            simulationId: undefined, // simulationId not included in new structure
            homeTeam: statistics.homeTeam.name,
            awayTeam: statistics.awayTeam.name,
            homeScore: statistics.homeTeam.score,
            awayScore: statistics.awayTeam.score,
            status: statistics.matchInfo.status,
          });
        }
      }
    );

    return () => {
      // Leave match statistics group when component unmounts or match changes
      signalRService.leaveMatchStatistics(liveMatchData.id);
    };
  }, [signalRConnected, liveMatchData?.id]);

  // Fetch initial live match data (less frequent polling)
  useEffect(() => {
    const fetchLiveMatch = async () => {
      if (!userId) {
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        const response = await matchService.getLiveMatchForUser(userId);

        if (response.succeeded && response.hasLiveMatch && response.liveMatch) {
          setLiveMatchData(response.liveMatch);
          setHasLiveMatch(true);

          // Check if we have valid stored statistics for this match
          if (
            liveMatchStorageService.isStoredStatisticsValid(
              response.liveMatch.id
            )
          ) {
            const { statistics, updateTime } =
              liveMatchStorageService.getRealtimeStatistics();
            if (statistics && updateTime) {
              setRealtimeStatistics(statistics);
              setLastUpdateTime(updateTime);
            }
          } else {
            // Clear invalid stored statistics
            liveMatchStorageService.clearRealtimeStatistics();
            setRealtimeStatistics(null);
            setLastUpdateTime(null);
          }

          // Store initial match data using storage service
          liveMatchStorageService.setLiveMatchData({
            matchId: response.liveMatch.id,
            homeTeam: response.liveMatch.homeTeam.name,
            awayTeam: response.liveMatch.awayTeam.name,
            homeScore: response.liveMatch.homeTeamScore,
            awayScore: response.liveMatch.awayTeamScore,
            status: response.liveMatch.matchStatus,
          });
        } else {
          setHasLiveMatch(false);
          setLiveMatchData(null);
          setRealtimeStatistics(null);

          // Clear storage when no live match
          liveMatchStorageService.clearLiveMatchData();

          // Only set error if the API call actually failed (succeeded: false)
          if (!response.succeeded && response.error) {
            setError(response.error);
          } else {
            // Clear any previous errors since this is a successful "no match" response
            setError('');
          }
        }
      } catch (err) {
        console.error('Error fetching live match:', err);
        setError('Failed to load live match');
        setHasLiveMatch(false);
        setLiveMatchData(null);
        setRealtimeStatistics(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveMatch();

    // Reduced polling frequency since we're using SignalR for real-time updates
    const pollInterval = setInterval(() => {
      fetchLiveMatch();
    }, 120000); // Every 2 minutes instead of 30 seconds

    return () => clearInterval(pollInterval);
  }, [userId]);

  // Format match time from UTC date
  const formatMatchTime = (utcDate: string): string => {
    const now = new Date();
    const matchDate = new Date(utcDate);
    const diffMs = now.getTime() - matchDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 0) {
      return 'Not Started';
    } else if (diffMinutes <= 90) {
      return `${diffMinutes}'`;
    } else {
      return 'Full Time';
    }
  };

  // Handle navigation to match details page (only if there's a live match)
  const handleMatchClick = () => {
    if (hasLiveMatch && liveMatchData?.id) {
      router.push(`/matchdetails?matchId=${liveMatchData.id}`);
    }
  };

  // Handle navigation to simulation view
  const handleSimulationClick = () => {
    const simulationUrl = liveMatchStorageService.getSimulationViewUrl();
    if (simulationUrl) {
      router.push(simulationUrl);
    } else if (hasLiveMatch && liveMatchData?.id) {
      // Fallback: navigate to match details and let user access simulation from there
      router.push(`/matchdetails?matchId=${liveMatchData.id}`);
    }
  };

  // Combined real-time data monitoring and updates effect
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let cleanupInterval: NodeJS.Timeout;

    // Force immediate re-render when new statistics arrive
    if (realtimeStatistics) {
      setUpdateCounter((prev) => prev + 1);
    }

    // Set up periodic validation and cleanup of stored data
    if (hasLiveMatch && liveMatchData) {
      cleanupInterval = setInterval(() => {
        // Check if stored statistics are still valid
        if (
          !liveMatchStorageService.isStoredStatisticsValid(liveMatchData.id, 60)
        ) {
          liveMatchStorageService.clearRealtimeStatistics();
        }
      }, 300000); // Check every 5 minutes
    }

    // Set up update counter for "time ago" display
    if (realtimeStatistics && lastUpdateTime) {
      const scheduleNextUpdate = () => {
        timeoutId = setTimeout(() => {
          setUpdateCounter((prev) => prev + 1);
          scheduleNextUpdate(); // Schedule the next update
        }, 10000);
      };

      // Start the update cycle
      scheduleNextUpdate();
    }

    // Debug keyboard shortcut for force refresh
    const handleKeyPress = (event: KeyboardEvent) => {
      // Press Ctrl+Shift+R to force refresh data (for debugging)
      if (event.key === 'r' && event.ctrlKey && event.shiftKey) {
        setUpdateCounter((prev) => prev + 1);
        setViewportKey((prev) => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (cleanupInterval) {
        clearInterval(cleanupInterval);
      }
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [realtimeStatistics, lastUpdateTime, hasLiveMatch, liveMatchData]);

  // Get current match time for display - prioritize real-time data
  const getCurrentMatchTime = (): string => {
    if (realtimeStatistics) {
      // First priority: Use timeStamp which is the match time in "MM:SS" format
      if (realtimeStatistics.timeStamp) {
        // timeStamp is already in match time format like "90:00"
        return realtimeStatistics.timeStamp;
      }
      // Second priority: Use currentMinute if available
      if (typeof realtimeStatistics.matchInfo.currentMinute === 'number') {
        const timeStr = `${realtimeStatistics.matchInfo.currentMinute}'`;
        return timeStr;
      }
    }

    // Fallback to initial match data
    if (liveMatchData?.scheduledDateTimeUtc) {
      const fallbackTime = formatMatchTime(liveMatchData.scheduledDateTimeUtc);
      return fallbackTime;
    }

    return '00:00';
  };

  // Get time elapsed since last update for live indicator
  const getRealTimeTimestamp = (): string => {
    if (realtimeStatistics && lastUpdateTime) {
      const now = new Date();
      const diffMs = now.getTime() - lastUpdateTime.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);

      if (diffSeconds < 10) {
        return 'just now';
      } else if (diffSeconds < 60) {
        return `${diffSeconds} seconds ago`;
      } else if (diffMinutes < 60) {
        return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
      } else {
        return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
      }
    }
    return '';
  };

  // Use real-time statistics if available, otherwise fall back to initial match data
  const getCurrentStatistics = () => {
    if (realtimeStatistics) {
      return {
        homeTeamScore: realtimeStatistics.homeTeam.score,
        awayTeamScore: realtimeStatistics.awayTeam.score,
        homeTeamPossession: realtimeStatistics.homeTeam.possession,
        awayTeamPossession: realtimeStatistics.awayTeam.possession,
        homeTeamShots: realtimeStatistics.homeTeam.shots,
        awayTeamShots: realtimeStatistics.awayTeam.shots,
        homeTeamShotsOnTarget: realtimeStatistics.homeTeam.shotsOnTarget,
        awayTeamShotsOnTarget: realtimeStatistics.awayTeam.shotsOnTarget,
        homeTeamCorners: realtimeStatistics.homeTeam.corners,
        awayTeamCorners: realtimeStatistics.awayTeam.corners,
        homeTeamFouls: realtimeStatistics.homeTeam.fouls,
        awayTeamFouls: realtimeStatistics.awayTeam.fouls,
        homeTeamYellowCards: realtimeStatistics.homeTeam.yellowCards,
        awayTeamYellowCards: realtimeStatistics.awayTeam.yellowCards,
        homeTeamRedCards: realtimeStatistics.homeTeam.redCards,
        awayTeamRedCards: realtimeStatistics.awayTeam.redCards,
        matchStatus: realtimeStatistics.matchInfo.status,
        isLive: realtimeStatistics.matchInfo.isLive,
      };
    } else if (liveMatchData) {
      return {
        homeTeamScore: liveMatchData.homeTeamScore,
        awayTeamScore: liveMatchData.awayTeamScore,
        homeTeamPossession: liveMatchData.homeTeamPossession,
        awayTeamPossession: liveMatchData.awayTeamPossession,
        homeTeamShots: liveMatchData.homeTeamShots,
        awayTeamShots: liveMatchData.awayTeamShots,
        homeTeamShotsOnTarget: liveMatchData.homeTeamShotsOnTarget,
        awayTeamShotsOnTarget: liveMatchData.awayTeamShotsOnTarget,
        homeTeamCorners: liveMatchData.homeTeamCorners,
        awayTeamCorners: liveMatchData.awayTeamCorners,
        homeTeamFouls: liveMatchData.homeTeamFouls,
        awayTeamFouls: liveMatchData.awayTeamFouls,
        homeTeamYellowCards: liveMatchData.homeTeamYellowCards,
        awayTeamYellowCards: liveMatchData.awayTeamYellowCards,
        homeTeamRedCards: liveMatchData.homeTeamRedCards,
        awayTeamRedCards: liveMatchData.awayTeamRedCards,
        matchStatus: liveMatchData.matchStatus,
        isLive: liveMatchData.isLive,
      };
    }
    return null;
  };

  const currentStats = useMemo(
    () => getCurrentStatistics(),
    [realtimeStatistics, liveMatchData]
  );
  const currentMatchTime = useMemo(
    () => getCurrentMatchTime(),
    [realtimeStatistics, liveMatchData]
  );
  const realTimeTimestamp = useMemo(
    () => getRealTimeTimestamp(),
    [realtimeStatistics, lastUpdateTime, updateCounter]
  );

  // Use live match data if available, fallback to props for display when no live match
  const displayData = useMemo(() => {
    const data =
      hasLiveMatch && liveMatchData && currentStats
        ? {
            homeTeam: {
              name:
                liveMatchData.homeTeam.shortName || liveMatchData.homeTeam.name,
              logo: liveMatchData.homeTeam.logo || '/logos/PixelPitch.png',
            },
            awayTeam: {
              name:
                liveMatchData.awayTeam.shortName || liveMatchData.awayTeam.name,
              logo: liveMatchData.awayTeam.logo || '/logos/PixelPitch.png',
            },
            homeScore: currentStats.homeTeamScore,
            awayScore: currentStats.awayTeamScore,
            matchTime: currentMatchTime,
            realTimeTimestamp: realTimeTimestamp,
            isLive: currentStats.isLive || currentStats.matchStatus === 'Live',
            status: currentStats.matchStatus,
            hasRealTimeData: !!realtimeStatistics,
            stats: [
              {
                label: 'Possession',
                homeValue: currentStats.homeTeamPossession,
                awayValue: currentStats.awayTeamPossession,
              },
              {
                label: 'Shots on Target',
                homeValue: currentStats.homeTeamShotsOnTarget,
                awayValue: currentStats.awayTeamShotsOnTarget,
              },
              {
                label: 'Shots',
                homeValue: currentStats.homeTeamShots,
                awayValue: currentStats.awayTeamShots,
              },
              {
                label: 'Corners',
                homeValue: currentStats.homeTeamCorners,
                awayValue: currentStats.awayTeamCorners,
              },
              {
                label: 'Fouls',
                homeValue: currentStats.homeTeamFouls,
                awayValue: currentStats.awayTeamFouls,
              },
              {
                label: 'Yellow Cards',
                homeValue: currentStats.homeTeamYellowCards,
                awayValue: currentStats.awayTeamYellowCards,
              },
            ],
          }
        : {
            homeTeam: homeTeam || {
              name: 'Team A',
              logo: '/logos/barcelona.png',
            },
            awayTeam: awayTeam || {
              name: 'Team B',
              logo: '/logos/real madrid.png',
            },
            homeScore: homeScore || 0,
            awayScore: awayScore || 0,
            matchTime: matchTime || '00:00',
            isLive: false,
            status: 'No Live Match' as const,
            hasRealTimeData: false,
            stats: stats || [
              { label: 'Possession', homeValue: 50, awayValue: 50 },
              { label: 'Shots on Target', homeValue: 5, awayValue: 3 },
              { label: 'Shots', homeValue: 10, awayValue: 7 },
            ],
          };

    return data;
  }, [
    hasLiveMatch,
    liveMatchData,
    currentStats,
    currentMatchTime,
    realTimeTimestamp,
    realtimeStatistics,
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    stats,
    matchTime,
    lastUpdateTime,
    updateCounter,
    viewportKey,
  ]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-md p-6">
        <div
          className={`relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl ${
            isMounted && isDarkMode
              ? 'border-gray-700/20 bg-gradient-to-br from-gray-800/20 to-gray-900/5'
              : 'border-white/20 bg-gradient-to-br from-white/20 to-white/5'
          }`}
          suppressHydrationWarning
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-green-400/10 via-blue-400/10 to-purple-400/10"></div>

          {/* Loading content */}
          <div className="relative z-10 flex flex-col items-center justify-center px-6 py-12">
            {/* Animated football */}
            <div className="relative mb-6">
              <div className="absolute inset-0 animate-ping rounded-full bg-green-400/30"></div>
              <div className="relative rounded-full border border-green-400/30 bg-gradient-to-br from-green-400/20 to-emerald-400/20 p-4 backdrop-blur-sm">
                <div className="animate-spin">
                  <div className="h-8 w-8 rounded-full border-2 border-green-400 border-t-transparent"></div>
                </div>
              </div>
            </div>

            <h3 className="mb-2 text-lg font-semibold text-gray-700">
              Loading Match
            </h3>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 animate-bounce rounded-full bg-green-400 delay-0"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-green-400 delay-100"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-green-400 delay-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-md p-6">
        <div
          className={`relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl ${
            isMounted && isDarkMode
              ? 'border-red-800/50 bg-gradient-to-br from-red-900/80 to-red-800/60'
              : 'border-red-200/50 bg-gradient-to-br from-red-50/80 to-red-100/60'
          }`}
          suppressHydrationWarning
        >
          {/* Animated background */}
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-red-400/5 to-orange-400/5"></div>

          <div className="relative z-10 px-6 py-8 text-center">
            <div className="mb-4 animate-bounce text-4xl">⚠️</div>
            <h3
              className={`mb-2 text-lg font-semibold ${
                isMounted && isDarkMode ? 'text-red-400' : 'text-red-600'
              }`}
              suppressHydrationWarning
            >
              Connection Error
            </h3>
            <p
              className={`mb-4 text-sm ${
                isMounted && isDarkMode ? 'text-red-300' : 'text-red-500'
              }`}
              suppressHydrationWarning
            >
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-red-600 hover:to-red-700"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show "No Live Match" state when user has no active live match
  if (!hasLiveMatch) {
    return (
      <div className="mx-auto w-full max-w-md p-6">
        <div
          className={`relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl ${
            isMounted && isDarkMode
              ? 'border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/60'
              : 'border-gray-200/50 bg-gradient-to-br from-gray-50/80 to-gray-100/60'
          }`}
          suppressHydrationWarning
        >
          {/* Animated background patterns */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-4 left-4 h-2 w-2 animate-ping rounded-full bg-gray-300"></div>
            <div className="absolute right-6 bottom-6 h-1 w-1 animate-pulse rounded-full bg-gray-400 delay-300"></div>
            <div className="absolute top-1/2 right-4 h-1.5 w-1.5 animate-bounce rounded-full bg-gray-300 delay-500"></div>
          </div>

          <div className="relative z-10 px-6 py-10 text-center">
            <div className="mb-4 animate-bounce text-5xl">⚽</div>
            <h3 className="mb-3 text-xl font-bold text-gray-700">
              No Live Match
            </h3>
            <p className="mb-2 text-sm text-gray-500">
              You don't have any live matches at the moment.
            </p>
            <p className="text-xs text-gray-400">
              Check back later for upcoming matches.
            </p>

            {/* Decorative elements */}
            <div className="mt-6 flex justify-center space-x-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-gray-300"></div>
              <div className="h-2 w-2 animate-pulse rounded-full bg-gray-300 delay-100"></div>
              <div className="h-2 w-2 animate-pulse rounded-full bg-gray-300 delay-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md p-6">
      <div
        className={`relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 ${
          hasLiveMatch
            ? 'hover:shadow-3xl cursor-pointer border-white/30 bg-gradient-to-br from-white/25 to-white/10 hover:scale-[1.02] hover:border-white/50'
            : 'border-white/20 bg-gradient-to-br from-white/20 to-white/5'
        }`}
        onClick={hasLiveMatch ? handleMatchClick : undefined}
      >
        {/* Animated background gradient overlay */}
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-green-400/10 via-blue-400/5 to-purple-400/10"></div>

        {/* Glowing border effect for live matches */}
        {displayData.isLive && (
          <div className="absolute inset-0 animate-pulse rounded-2xl border-2 border-red-400/50"></div>
        )}

        {/* Content container */}
        <div className="relative z-10 p-6">
          {/* Match Status and Time */}
          <div className="mb-4 flex items-center justify-center gap-3">
            {displayData.isLive && (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 animate-pulse rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
                <span className="text-sm font-bold tracking-wide text-red-500">
                  LIVE
                </span>
                {/* Real-time data indicator */}
                {displayData.hasRealTimeData && (
                  <div className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1 text-xs">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400"></div>
                    <span className="font-medium text-green-400">
                      Real-time
                    </span>
                  </div>
                )}
              </div>
            )}
            <div className="rounded-full border border-white/30 bg-white/20 px-3 py-1 backdrop-blur-sm">
              <p
                className={`text-sm font-semibold ${displayData.isLive ? 'text-red-500' : 'text-green-600'}`}
              >
                {displayData.matchTime}
              </p>
            </div>
          </div>

          {/* Match Time with Heartbeat Animation */}
          {displayData.isLive && (
            <div className="mb-4 flex items-center justify-center">
              <div className="flex items-center gap-2 rounded-full border border-red-300/30 bg-red-100/20 px-3 py-1 backdrop-blur-sm">
                <div className="relative">
                  {/* Primary heartbeat indicator */}
                  <div className="h-2 w-2 animate-ping rounded-full bg-red-600"></div>
                  {/* Secondary heartbeat with different timing */}
                  <div
                    className="absolute inset-0 h-2 w-2 rounded-full bg-red-500"
                    style={{
                      animation:
                        'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-red-600">
                  {displayData.realTimeTimestamp
                    ? `Updated: ${displayData.realTimeTimestamp}`
                    : displayData.matchTime}
                </span>
              </div>
            </div>
          )}

          {/* Teams and Score */}
          <div className="mb-6 flex items-center justify-between">
            {/* Home Team */}
            <div className="group flex flex-col items-center">
              <div className="relative mb-3">
                <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-400/20 blur"></div>
                <Image
                  src={displayData.homeTeam.logo}
                  alt={displayData.homeTeam.name}
                  width={52}
                  height={52}
                  className="relative rounded-full border-2 border-white/30 shadow-xl transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = '/logos/Footex.png';
                  }}
                />
              </div>
              <span className="max-w-[70px] text-center text-xs leading-tight font-medium text-gray-700">
                {displayData.homeTeam.name}
              </span>
            </div>

            {/* Score */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-white/10 blur"></div>
              <div className="relative min-w-[120px] rounded-2xl border border-white/30 bg-gradient-to-br from-white/40 to-white/20 px-8 py-5 shadow-xl backdrop-blur-sm">
                <div className="text-center text-3xl font-bold tracking-wide whitespace-nowrap text-gray-800">
                  {displayData.homeScore} - {displayData.awayScore}
                </div>
              </div>
            </div>

            {/* Away Team */}
            <div className="group flex flex-col items-center">
              <div className="relative mb-3">
                <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-400/20 blur"></div>
                <Image
                  src={displayData.awayTeam.logo}
                  alt={displayData.awayTeam.name}
                  width={52}
                  height={52}
                  className="relative rounded-full border-2 border-white/30 shadow-xl transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = '/logos/Footex.png';
                  }}
                />
              </div>
              <span className="max-w-[70px] text-center text-xs leading-tight font-medium text-gray-700">
                {displayData.awayTeam.name}
              </span>
            </div>
          </div>

          {/* Statistics */}
          <div className="space-y-2">
            {displayData.stats.map((stat, index) => (
              <StatBar
                key={index}
                label={stat.label}
                leftValue={stat.homeValue}
                rightValue={stat.awayValue}
                leftColor="#f59e0b"
                rightColor="#3b82f6"
              />
            ))}
          </div>

          {/* Click indicator for live matches */}
          {hasLiveMatch && (
            <div className="mt-4 space-y-2">
              {/* Match Details Button */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs text-gray-600 backdrop-blur-sm transition-all duration-300 hover:bg-white/30">
                  <span>🔍</span>
                  <span>Click for details</span>
                </div>
              </div>

              {/* Simulation View Button */}
              {displayData.isLive && (
                <div className="text-center">
                  <button
                    onClick={handleSimulationClick}
                    className="inline-flex items-center gap-2 rounded-full border border-blue-400/50 bg-blue-500/20 px-4 py-2 text-xs font-medium text-blue-400 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-blue-400/70 hover:bg-blue-500/30"
                  >
                    <span>⚡</span>
                    <span>Live Simulation</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Decorative corner elements */}
        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-gradient-to-br from-white/40 to-transparent"></div>
        <div className="absolute bottom-2 left-2 h-1 w-1 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
      </div>
    </div>
  );
}
