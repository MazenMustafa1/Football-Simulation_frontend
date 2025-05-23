'use client';
import Sidebar from '../Components/Sidebar/Sidebar';
import { SidebarItem } from '../Components/Sidebar/SidebarItem';
import {
    Settings,
    Calendar,
    Package,
    LayoutDashboardIcon,
    LogOutIcon, ClubIcon,
    Bell,
    Users,
    User,
    Search,
    Home
} from 'lucide-react';
import Navbar from "@/app/Components/Navbar/Navbar";
import DashboardImage from "@/app/Components/DashboardImage/DashboardImage";
import LatestMatches from "@/app/Components/LatestMatches/LatestMatches";
import RightPanel from "@/app/Components/RightPanel/RightPanel";
import LiveMatchPanel from "@/app/Components/RightPanel/LiveMatchPanel";
import TeamsList from "@/app/Components/RightPanel/TeamsList";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/Services/AuthenticationService';
import teamService, { Team } from '@/Services/TeamService';
import Image from 'next/image';

export default function Dashboard() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
            router.push('/login');
            return;
        }

        // Fetch initial data
        fetchDashboardData().then(() => {});

        // Set up token refresh interval
        const refreshInterval = setInterval(async () => {
           await authService.checkAndRefreshToken();
        }, 5 * 60 * 1000); // Check every 5 minutes

        return () => clearInterval(refreshInterval);
    }, [router]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            await fetchTeams();
            checkUserRole();
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTeams = async () => {
        try {
            // Use TeamService instead of directly calling ApiService
            const response = await teamService.getAllTeams();

            // Ensure that teams is always an array, even if the API returns something unexpected
            if (Array.isArray(response)) {
                // @ts-ignore
                setTeams(response);
            }
            else {
                // If response is not an array or doesn't have a data property that's an array, set to empty array
                console.error('Unexpected API response format for teams:', response);
                setTeams([]);
            }
        } catch (error) {
            console.error('Error fetching teams:', error);
            setTeams([]); // Set empty array on error instead of throwing
        }
    };

    const checkUserRole = () => {
        // Use the auth service to check if user has admin role
        setIsAdmin(authService.hasRole('Admin'));
    };

    const handleLogout = () => {
        authService.logout();
        router.push('/login');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-green-800 to-green-900">
                <div className="animate-bounce">
                    <Image src="/logos/barcelona.png" alt="Loading" width={80} height={80} className="animate-pulse" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-green-800 to-green-900">
                <div className="bg-white border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-lg">
                    <p className="font-bold text-xl mb-2">Error</p>
                    <p className="mb-4">{error}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg shadow transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen relative">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-5">
                <Image
                    src="/images/football-pattern.png"
                    alt="Football Pattern"
                    fill
                    className="object-cover"
                />
            </div>

            <Sidebar>
                {/* Main Navigation */}
                <Link href="/dashboard">
                    <SidebarItem icon={<LayoutDashboardIcon size={20} />} text="Dashboard" active />
                </Link>
                <Link href="/teams">
                    <SidebarItem icon={<ClubIcon size={20} />} text="Teams" />
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

                {/* Shop & Notifications */}
                <div className="px-4 text-xs font-semibold text-gray-400 uppercase mt-4 mb-2">Shop & Updates</div>
                <Link href="/products">
                    <SidebarItem icon={<Package size={20} />} text="Shop" alert />
                </Link>
                <Link href="/notifications">
                    <SidebarItem icon={<Bell size={20} />} text="Notifications" />
                </Link>

                {/* Search & Settings */}
                <div className="px-4 text-xs font-semibold text-gray-400 uppercase mt-4 mb-2">Other</div>
                <Link href="/search">
                    <SidebarItem icon={<Search size={20} />} text="Search" />
                </Link>
                <Link href="/settings">
                    <SidebarItem icon={<Settings size={20} />} text="Settings" />
                </Link>
            </Sidebar>

            <div className="w-full relative z-10">
                <Navbar />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                    {/* Main Content (Photo + Match Cards) */}
                    <div className="md:col-span-2">
                        <div className="bg-white/90 rounded-2xl shadow-xl overflow-hidden">
                            <DashboardImage />

                            {/* Today's Matches Banner */}
                            <div className="bg-gradient-to-r from-green-700 to-green-900 py-3 px-6 text-white">
                                <h2 className="text-xl font-bold flex items-center">
                                    <Calendar size={18} className="mr-2" />
                                    Today's Matches
                                </h2>
                            </div>

                            <div className="p-4">
                                <LatestMatches />
                            </div>
                        </div>

                        {/* Football News Section */}
                        <div className="mt-6 bg-white/90 rounded-2xl shadow-xl p-6">
                            <h2 className="text-xl font-bold mb-4 border-b-2 border-green-500 pb-2">Football Highlights</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <h3 className="font-bold text-green-800">Transfer News</h3>
                                    <p className="text-sm text-gray-600 mt-2">Latest transfers and rumors from top European leagues.</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <h3 className="font-bold text-green-800">League Table Updates</h3>
                                    <p className="text-sm text-gray-600 mt-2">Check the current standings in your favorite leagues.</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <h3 className="font-bold text-green-800">Player of the Month</h3>
                                    <p className="text-sm text-gray-600 mt-2">Discover who won the latest player awards.</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <h3 className="font-bold text-green-800">Upcoming Tournaments</h3>
                                    <p className="text-sm text-gray-600 mt-2">Stay informed about upcoming football tournaments.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="hidden md:block">
                        <RightPanel title="Live Match">
                            <LiveMatchPanel
                                homeTeam={{ name: 'Barcelona', logo: '/logos/barcelona.png' }}
                                awayTeam={{ name: 'Real Madrid', logo: '/logos/real madrid.png' }}
                                homeScore={2}
                                awayScore={1}
                                matchTime="65:23"
                                stats={[
                                    { label: 'Possession', homeValue: 62, awayValue: 38 },
                                    { label: 'Shots on Target', homeValue: 8, awayValue: 4 },
                                    { label: 'Shots', homeValue: 15, awayValue: 9 },
                                    { label: 'Corner Kicks', homeValue: 6, awayValue: 2 },
                                    { label: 'Fouls', homeValue: 10, awayValue: 12 }
                                ]}
                            />

                            <div className="flex flex-col gap-2 px-3 pt-2 pb-4 bg-white/90 rounded-xl shadow-md mt-4">
                                <h1 className="font-bold text-xl mb-1 text-green-800">Quick Links</h1>
                                <div className="grid grid-cols-2 gap-2">
                                    <Link href="/matchdetails" className="w-full">
                                        <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2 px-3 rounded-lg shadow transition-colors">
                                            <Calendar size={16} />
                                            <span>Match Details</span>
                                        </button>
                                    </Link>
                                    <Link href="/profile" className="w-full">
                                        <button className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white py-2 px-3 rounded-lg shadow transition-colors">
                                            <User size={16} />
                                            <span>Profile</span>
                                        </button>
                                    </Link>
                                </div>

                                {isAdmin && (
                                    <Link href="/admin" className="w-full mt-1">
                                        <button className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2 px-3 rounded-lg shadow transition-colors">
                                            <Settings size={16} />
                                            <span>Admin Dashboard</span>
                                        </button>
                                    </Link>
                                )}
                            </div>

                            <div className="bg-white/90 rounded-xl shadow-md mt-4 py-3">
                                <h1 className="font-bold px-3 text-xl text-green-800 mb-2">Teams</h1>
                                <TeamsList
                                    teams={teams}
                                    onSelect={(team) => console.log('Selected:', team)}
                                />
                            </div>
                        </RightPanel>
                    </div>
                </div>

                {/* Mobile Quick Links - only visible on mobile */}
                <div className="md:hidden flex flex-col gap-3 p-4 mt-2 mb-8">
                    <h2 className="font-bold text-lg text-center text-green-800">Quick Access</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/matchdetails" className="w-full">
                            <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-lg shadow transition-colors">
                                <Calendar size={18} />
                                <span>Match Details</span>
                            </button>
                        </Link>
                        <Link href="/profile" className="w-full">
                            <button className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white py-3 px-4 rounded-lg shadow transition-colors">
                                <User size={18} />
                                <span>Profile</span>
                            </button>
                        </Link>
                    </div>

                    {isAdmin && (
                        <Link href="/admin" className="w-full">
                            <button className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-lg shadow transition-colors mt-1">
                                <Settings size={18} />
                                <span>Admin Dashboard</span>
                            </button>
                        </Link>
                    )}
                </div>

                {/* Footer with football-themed pattern */}
                <div className="mt-6 py-4 border-t border-gray-200 text-center text-gray-500 text-sm relative">
                    <div className="relative z-10">
                        © {new Date().getFullYear()} Footex - Your Ultimate Football Experience
                    </div>
                </div>
            </div>
        </div>
    );
}
