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
} from 'lucide-react';
import { SidebarLayout } from '../Components/Sidebar/Sidebar';
import { SidebarItem } from '../Components/Sidebar/SidebarItem';
import { SidebarSection } from '../Components/Sidebar/SidebarSection';
import ProtectedRoute from '@/app/Components/ProtectedRoute/ProtectedRoute';
import teamService, { Team } from '@/Services/TeamService';
import authService from '@/Services/AuthenticationService';

interface TeamStats {
  wins: number;
  losses: number;
  draws: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    setIsAdmin(authService.hasRole('Admin'));
    fetchTeams();
  }, [router]);

  useEffect(() => {
    // Filter teams based on search query
    if (searchQuery.trim() === '') {
      setFilteredTeams(teams);
    } else {
      const filtered = teams.filter(
        (team) =>
          team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          team.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          team.league?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTeams(filtered);
    }
  }, [teams, searchQuery]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const teamsData = await teamService.getAllTeams();
      setTeams(teamsData);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to load teams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTeamStats = (team: Team): TeamStats => {
    // Mock stats - replace with actual data from your API
    return {
      wins: Math.floor(Math.random() * 20),
      losses: Math.floor(Math.random() * 10),
      draws: Math.floor(Math.random() * 8),
      goalsFor: Math.floor(Math.random() * 50) + 20,
      goalsAgainst: Math.floor(Math.random() * 30) + 10,
      points: Math.floor(Math.random() * 60) + 20,
    };
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['User', 'Admin', 'Coach', 'Player']}>
        <SidebarLayout sidebar={<TeamsSidebar isAdmin={isAdmin} />}>
          <div className="relative flex h-screen items-center justify-center">
            <BackgroundElements />
            <div className="relative z-10 flex flex-col items-center space-y-6">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
              <h2 className="text-2xl font-bold text-gray-800">
                Loading Teams...
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
        <SidebarLayout sidebar={<TeamsSidebar isAdmin={isAdmin} />}>
          <div className="relative flex h-screen items-center justify-center">
            <BackgroundElements />
            <div className="relative z-10 text-center">
              <div className="rounded-lg border-l-4 border-red-500 bg-white p-6 text-red-700 shadow-lg">
                <p className="mb-2 text-xl font-bold">Error</p>
                <p className="mb-4">{error}</p>
                <button
                  onClick={fetchTeams}
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
      <SidebarLayout sidebar={<TeamsSidebar isAdmin={isAdmin} />}>
        <div className="relative min-h-screen">
          <BackgroundElements />

          <div className="relative z-10 p-6">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
                  <p className="mt-2 text-gray-600">
                    Explore all teams and their performance statistics
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="rounded-lg bg-white/80 p-4 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                      <ClubIcon className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {teams.length}
                        </p>
                        <p className="text-sm text-gray-600">Total Teams</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search teams by name, city, or league..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white/80 py-3 pr-4 pl-10 text-gray-900 placeholder-gray-500 backdrop-blur-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                />
              </div>
              <button className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-white/80 px-4 py-3 text-gray-700 backdrop-blur-sm transition-colors hover:bg-gray-50">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
            </div>

            {/* Teams Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTeams.map((team) => {
                const stats = getTeamStats(team);
                return (
                  <Link
                    key={team.id}
                    href={`/teams/${team.id}`}
                    className="group transform transition-all duration-200 hover:scale-105"
                  >
                    <div className="rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
                      {/* Team Header */}
                      <div className="mb-4 flex items-center space-x-4">
                        <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 p-1">
                          <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                            {team.logo ? (
                              <Image
                                src={team.logo}
                                alt={`${team.name} logo`}
                                width={48}
                                height={48}
                                className="rounded-full object-cover"
                              />
                            ) : (
                              <ClubIcon className="h-8 w-8 text-green-600" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-green-600">
                            {team.name}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{team.city || 'City not specified'}</span>
                          </div>
                          {team.league && (
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Trophy className="h-4 w-4" />
                              <span>{team.league}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Team Stats */}
                      <div className="grid grid-cols-3 gap-4 rounded-lg bg-gray-50/50 p-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {stats.points}
                          </p>
                          <p className="text-xs text-gray-600">Points</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">
                            {stats.wins}
                          </p>
                          <p className="text-xs text-gray-600">Wins</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-600">
                            {stats.goalsFor}
                          </p>
                          <p className="text-xs text-gray-600">Goals</p>
                        </div>
                      </div>

                      {/* Team Performance Indicator */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-current text-yellow-500" />
                          <span className="text-sm font-medium text-gray-700">
                            {(
                              (stats.wins /
                                (stats.wins + stats.losses + stats.draws)) *
                              5
                            ).toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <TrendingUp className="h-4 w-4" />
                          <span>View Details</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredTeams.length === 0 && !loading && (
              <div className="py-12 text-center">
                <ClubIcon className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  No teams found
                </h3>
                <p className="text-gray-600">
                  {searchQuery
                    ? 'Try adjusting your search terms.'
                    : 'No teams available at the moment.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}

function TeamsSidebar({ isAdmin }: { isAdmin: boolean }) {
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
        <SidebarItem icon={<ClubIcon size={20} />} text="Teams" active />
      </Link>
      <Link href="/schedule">
        <SidebarItem icon={<Calendar size={20} />} text="Schedule" />
      </Link>
      <Link href="/players">
        <SidebarItem icon={<User size={20} />} text="Players" />
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
