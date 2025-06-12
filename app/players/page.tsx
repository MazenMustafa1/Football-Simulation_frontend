'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Filter,
  Users,
  Trophy,
  Calendar,
  MapPin,
  Star,
  TrendingUp,
  Settings,
  ClubIcon,
  Bell,
  User,
  Package,
  Home,
  LayoutDashboardIcon,
  Activity,
  Zap,
} from 'lucide-react';
import { SidebarLayout } from '../Components/Sidebar/Sidebar';
import { SidebarItem } from '../Components/Sidebar/SidebarItem';
import { SidebarSection } from '../Components/Sidebar/SidebarSection';
import ProtectedRoute from '@/app/Components/ProtectedRoute/ProtectedRoute';
import playerService, { Player } from '@/Services/PlayerService';
import authService from '@/Services/AuthenticationService';

interface PlayerStats {
  goals: number;
  assists: number;
  matches: number;
  rating: number;
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

  useEffect(() => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    setIsAdmin(authService.hasRole('Admin'));
    fetchPlayers();
  }, [router]);

  useEffect(() => {
    // Filter players based on search query and position
    let filtered = players;

    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(
        (player) =>
          `${player.fullName} ${player.knownName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          player.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
          player.nationality?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (positionFilter !== '') {
      filtered = filtered.filter(
        (player) => player.position === positionFilter
      );
    }

    setFilteredPlayers(filtered);
  }, [players, searchQuery, positionFilter]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      setError(null);
      const playersData = await playerService.getPlayers();
      setPlayers(playersData);
    } catch (err) {
      console.error('Error fetching players:', err);
      setError('Failed to load players. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPlayerStats = (player: Player): PlayerStats => {
    // Mock stats - replace with actual data from your API
    return {
      goals: Math.floor(Math.random() * 25),
      assists: Math.floor(Math.random() * 15),
      matches: Math.floor(Math.random() * 30) + 10,
      rating: Math.random() * 2 + 7, // 7.0 to 9.0
    };
  };

  const getPositionColor = (position: string): string => {
    switch (position.toLowerCase()) {
      case 'goalkeeper':
        return 'bg-yellow-100 text-yellow-800';
      case 'defender':
        return 'bg-blue-100 text-blue-800';
      case 'midfielder':
        return 'bg-green-100 text-green-800';
      case 'forward':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['User', 'Admin', 'Coach', 'Player']}>
        <SidebarLayout sidebar={<PlayersSidebar isAdmin={isAdmin} />}>
          <div className="relative flex h-screen items-center justify-center">
            <BackgroundElements />
            <div className="relative z-10 flex flex-col items-center space-y-6">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
              <h2 className="text-2xl font-bold text-gray-800">
                Loading Players...
              </h2>
            </div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={['User', 'Admin', 'Coach', 'Player']}>
        <SidebarLayout sidebar={<PlayersSidebar isAdmin={isAdmin} />}>
          <div className="relative flex h-screen items-center justify-center">
            <BackgroundElements />
            <div className="relative z-10 text-center">
              <div className="rounded-lg border-l-4 border-red-500 bg-white p-6 text-red-700 shadow-lg">
                <p className="mb-2 text-xl font-bold">Error</p>
                <p className="mb-4">{error}</p>
                <button
                  onClick={fetchPlayers}
                  className="rounded-lg bg-red-500 px-4 py-2 text-white shadow transition-colors hover:bg-red-600"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['User', 'Admin', 'Coach', 'Player']}>
      <SidebarLayout sidebar={<PlayersSidebar isAdmin={isAdmin} />}>
        <div className="relative min-h-screen">
          <BackgroundElements />

          <div className="relative z-10 p-6">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Players</h1>
                  <p className="mt-2 text-gray-600">
                    Discover talented players and their performance statistics
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="rounded-lg bg-white/80 p-4 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                      <User className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {players.length}
                        </p>
                        <p className="text-sm text-gray-600">Total Players</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-6 flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search players by name, position, or nationality..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white/80 py-3 pr-4 pl-10 text-gray-900 placeholder-gray-500 backdrop-blur-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                />
              </div>
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white/80 px-4 py-3 text-gray-700 backdrop-blur-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
              >
                <option value="">All Positions</option>
                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
              <button className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-white/80 px-4 py-3 text-gray-700 backdrop-blur-sm transition-colors hover:bg-gray-50">
                <Filter className="h-4 w-4" />
                <span>More Filters</span>
              </button>
            </div>

            {/* Players Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPlayers.map((player) => {
                const stats = getPlayerStats(player);
                return (
                  <Link
                    key={player.id}
                    href={`/players/${player.id}`}
                    className="group transform transition-all duration-200 hover:scale-105"
                  >
                    <div className="rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
                      {/* Player Header */}
                      <div className="mb-4 text-center">
                        <div className="relative mx-auto mb-3 h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 p-1">
                          <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                            {player.image ? (
                              <Image
                                src={player.image}
                                alt={`${player.fullName} ${player.knownName}`}
                                width={64}
                                height={64}
                                className="rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-10 w-10 text-green-600" />
                            )}
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-green-600">
                          {player.fullName} {player.knownName}
                        </h3>
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getPositionColor(player.position)}`}
                        >
                          {player.position}
                        </span>
                      </div>

                      {/* Player Info */}
                      <div className="mb-4 space-y-2 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                          <span>Nationality:</span>
                          <span className="font-medium text-gray-900">
                            {player.nationality || 'Unknown'}
                          </span>
                        </div>
                      </div>

                      {/* Player Stats */}
                      <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50/50 p-3">
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-600">
                            {stats.goals}
                          </p>
                          <p className="text-xs text-gray-600">Goals</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-600">
                            {stats.assists}
                          </p>
                          <p className="text-xs text-gray-600">Assists</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-purple-600">
                            {stats.matches}
                          </p>
                          <p className="text-xs text-gray-600">Matches</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-orange-600">
                            {stats.rating.toFixed(1)}
                          </p>
                          <p className="text-xs text-gray-600">Rating</p>
                        </div>
                      </div>

                      {/* Performance Indicator */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-current text-yellow-500" />
                          <span className="text-sm font-medium text-gray-700">
                            {stats.rating.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Activity className="h-4 w-4" />
                          <span>View Profile</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredPlayers.length === 0 && !loading && (
              <div className="py-12 text-center">
                <User className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  No players found
                </h3>
                <p className="text-gray-600">
                  {searchQuery || positionFilter
                    ? 'Try adjusting your search terms or filters.'
                    : 'No players available at the moment.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}

function PlayersSidebar({ isAdmin }: { isAdmin: boolean }) {
  return (
    <>
      {/* Main Navigation */}
      <Link href="/dashboard">
        <SidebarItem
          icon={<LayoutDashboardIcon size={20} />}
          text="Dashboard"
        />
      </Link>
      <Link href="/teams">
        <SidebarItem icon={<ClubIcon size={20} />} text="Teams" />
      </Link>
      <Link href="/schedule">
        <SidebarItem icon={<Calendar size={20} />} text="Schedule" />
      </Link>
      <Link href="/players">
        <SidebarItem icon={<User size={20} />} text="Players" active />
      </Link>
      <Link href="/coaches">
        <SidebarItem icon={<Users size={20} />} text="Coaches" />
      </Link>
      <Link href="/stadiums">
        <SidebarItem icon={<Home size={20} />} text="Stadiums" />
      </Link>

      {/* Admin Section */}
      {isAdmin && (
        <>
          <SidebarSection title="Admin" color="text-amber-600" />
          <Link href="/admin">
            <SidebarItem icon={<Settings size={20} />} text="Admin Dashboard" />
          </Link>
        </>
      )}

      {/* Shop & Notifications */}
      <SidebarSection title="Shop & Updates" />
      <Link href="/products">
        <SidebarItem icon={<Package size={20} />} text="Shop" alert />
      </Link>
      <Link href="/notifications">
        <SidebarItem icon={<Bell size={20} />} text="Notifications" />
      </Link>

      {/* Search & Settings */}
      <SidebarSection title="Other" />
      <Link href="/search">
        <SidebarItem icon={<Search size={20} />} text="Search" />
      </Link>
      <Link href="/settings">
        <SidebarItem icon={<Settings size={20} />} text="Settings" />
      </Link>
    </>
  );
}

function BackgroundElements() {
  return (
    <div className="fixed inset-0 z-0">
      {/* Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50"></div>

      {/* Stadium Silhouette Background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <Image
          src="/images/Stadium dark.png"
          alt="Stadium Background"
          fill
          className="object-cover object-center"
        />
      </div>

      {/* Animated Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="animate-float absolute top-20 left-20 h-2 w-2 rounded-full bg-green-400/20"></div>
        <div className="animate-float-delayed absolute top-40 right-32 h-3 w-3 rounded-full bg-emerald-400/15"></div>
        <div className="animate-float-slow absolute bottom-32 left-40 h-1 w-1 rounded-full bg-teal-400/25"></div>
        <div className="animate-float-delayed absolute right-20 bottom-20 h-2 w-2 rounded-full bg-green-300/20"></div>
      </div>
    </div>
  );
}
