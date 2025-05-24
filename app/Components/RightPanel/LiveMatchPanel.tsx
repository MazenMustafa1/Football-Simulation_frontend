'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import matchService, {
  LiveMatch,
  LiveMatchResponse,
} from '@/Services/MatchService';

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
  const total = leftValue + rightValue || 1;
  const leftPercent = (leftValue / total) * 100;
  const rightPercent = (rightValue / total) * 100;

  return (
    <div className="my-3 w-full text-xs">
      <div className="mb-2 flex items-center justify-between px-2 font-medium text-gray-600">
        <span className="font-semibold text-green-600">{leftValue}</span>
        <span className="font-medium text-gray-500">{label}</span>
        <span className="font-semibold text-blue-600">{rightValue}</span>
      </div>
      <div className="relative flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100/50 backdrop-blur-sm">
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
  userId,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  stats,
  matchTime,
}: LiveMatchPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [liveMatchData, setLiveMatchData] = useState<LiveMatch | null>(null);
  const [hasLiveMatch, setHasLiveMatch] = useState(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  // Fetch live match for user
  useEffect(() => {
    const fetchLiveMatch = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        setError('');

        const response = await matchService.getLiveMatchForUser(userId);

        if (response.succeeded && response.hasLiveMatch && response.liveMatch) {
          setLiveMatchData(response.liveMatch);
          setHasLiveMatch(true);
        } else {
          setHasLiveMatch(false);
          setLiveMatchData(null);
          if (response.error) {
            setError(response.error);
          }
        }
      } catch (err) {
        console.error('Error fetching live match:', err);
        setError('Failed to load live match');
        setHasLiveMatch(false);
        setLiveMatchData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveMatch();

    // Set up polling for live match updates (every 30 seconds)
    const pollInterval = setInterval(fetchLiveMatch, 30000);

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

  // Use live match data if available, fallback to props for display when no live match
  const displayData =
    hasLiveMatch && liveMatchData
      ? {
          homeTeam: {
            name:
              liveMatchData.homeTeam.shortName || liveMatchData.homeTeam.name,
            logo: liveMatchData.homeTeam.logo || '/logos/Footex.png',
          },
          awayTeam: {
            name:
              liveMatchData.awayTeam.shortName || liveMatchData.awayTeam.name,
            logo: liveMatchData.awayTeam.logo || '/logos/Footex.png',
          },
          homeScore: liveMatchData.homeTeamScore,
          awayScore: liveMatchData.awayTeamScore,
          matchTime: formatMatchTime(liveMatchData.scheduledDateTimeUtc),
          isLive: liveMatchData.isLive,
          status: liveMatchData.matchStatus,
          stats: [
            {
              label: 'Possession',
              homeValue: liveMatchData.homeTeamPossession,
              awayValue: liveMatchData.awayTeamPossession,
            },
            {
              label: 'Shots on Target',
              homeValue: liveMatchData.homeTeamShotsOnTarget,
              awayValue: liveMatchData.awayTeamShotsOnTarget,
            },
            {
              label: 'Shots',
              homeValue: liveMatchData.homeTeamShots,
              awayValue: liveMatchData.awayTeamShots,
            },
            {
              label: 'Corners',
              homeValue: liveMatchData.homeTeamCorners,
              awayValue: liveMatchData.awayTeamCorners,
            },
            {
              label: 'Fouls',
              homeValue: liveMatchData.homeTeamFouls,
              awayValue: liveMatchData.awayTeamFouls,
            },
            {
              label: 'Yellow Cards',
              homeValue: liveMatchData.homeTeamYellowCards,
              awayValue: liveMatchData.awayTeamYellowCards,
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
          stats: stats || [
            { label: 'Possession', homeValue: 50, awayValue: 50 },
            { label: 'Shots on Target', homeValue: 5, awayValue: 3 },
            { label: 'Shots', homeValue: 10, awayValue: 7 },
          ],
        };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-sm p-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/20 to-white/5 shadow-2xl backdrop-blur-xl">
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
      <div className="mx-auto w-full max-w-sm p-6">
        <div className="relative overflow-hidden rounded-2xl border border-red-200/50 bg-gradient-to-br from-red-50/80 to-red-100/60 shadow-2xl backdrop-blur-xl">
          {/* Animated background */}
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-red-400/5 to-orange-400/5"></div>

          <div className="relative z-10 px-6 py-8 text-center">
            <div className="mb-4 animate-bounce text-4xl">⚠️</div>
            <h3 className="mb-2 text-lg font-semibold text-red-600">
              Connection Error
            </h3>
            <p className="mb-4 text-sm text-red-500">{error}</p>
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
      <div className="mx-auto w-full max-w-sm p-6">
        <div className="relative overflow-hidden rounded-2xl border border-gray-200/50 bg-gradient-to-br from-gray-50/80 to-gray-100/60 shadow-2xl backdrop-blur-xl">
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
    <div className="mx-auto w-full max-w-sm p-6">
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

          {/* Teams and Score */}
          <div className="mb-6 flex items-center justify-between">
            {/* Home Team */}
            <div className="group flex flex-col items-center">
              <div className="relative mb-3">
                <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-400/20 blur"></div>
                <Image
                  src={displayData.homeTeam.logo}
                  alt={displayData.homeTeam.name}
                  width={48}
                  height={48}
                  className="relative rounded-full border-2 border-white/30 shadow-xl transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = '/logos/Footex.png';
                  }}
                />
              </div>
              <span className="max-w-[60px] text-center text-xs leading-tight font-medium text-gray-700">
                {displayData.homeTeam.name}
              </span>
            </div>

            {/* Score */}
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-white/10 blur"></div>
              <div className="relative rounded-2xl border border-white/30 bg-gradient-to-br from-white/40 to-white/20 px-6 py-3 shadow-xl backdrop-blur-sm">
                <div className="text-2xl font-bold tracking-wider text-gray-800">
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
                  width={48}
                  height={48}
                  className="relative rounded-full border-2 border-white/30 shadow-xl transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = '/logos/Footex.png';
                  }}
                />
              </div>
              <span className="max-w-[60px] text-center text-xs leading-tight font-medium text-gray-700">
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
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs text-gray-600 backdrop-blur-sm transition-all duration-300 hover:bg-white/30">
                <span>🔍</span>
                <span>Click for details</span>
              </div>
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
