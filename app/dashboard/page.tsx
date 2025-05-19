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
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4CAF50]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="mt-2 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // @ts-ignore
    return (
        <div className="flex">
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

                {/* Shop & Notifications - using a div instead of conditional rendering with expanded */}
                <div className="px-4 text-xs font-semibold text-gray-400 uppercase mt-4 mb-2">Shop & Updates</div>
                <Link href="/products">
                    <SidebarItem icon={<Package size={20} />} text="Shop" alert />
                </Link>
                <Link href="/notifications">
                    <SidebarItem icon={<Bell size={20} />} text="Notifications" />
                </Link>

                {/* Search & Settings - using a div instead of conditional rendering with expanded */}
                <div className="px-4 text-xs font-semibold text-gray-400 uppercase mt-4 mb-2">Other</div>
                <Link href="/search">
                    <SidebarItem icon={<Search size={20} />} text="Search" />
                </Link>
                <Link href="/settings">
                    <SidebarItem icon={<Settings size={20} />} text="Settings" />
                </Link>
            </Sidebar>

            <div className="w-full">
                <Navbar />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                    {/* Main Content (Photo + Match Cards) */}
                    <div className="md:col-span-2">
                        <DashboardImage />
                        <LatestMatches />
                    </div>

                    {/* Right Sidebar */}
                    <div className="hidden md:block">
                        <RightPanel>
                            <LiveMatchPanel />

                            <div className="flex flex-col gap-2 px-3 pt-2 pb-4">
                                <h1 className="font-bold text-xl mb-1">Quick Links</h1>
                                <div className="grid grid-cols-2 gap-2">
                                    <Link href="/matchdetails" className="w-full">
                                        <button className="w-full flex items-center justify-center gap-2 bg-[#4CAF50] hover:bg-[#3e8e41] text-white py-2 px-3 rounded-lg shadow transition-colors">
                                            <Calendar size={16} />
                                            <span>Match Details</span>
                                        </button>
                                    </Link>
                                    <Link href="/profile" className="w-full">
                                        <button className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg shadow transition-colors">
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

                            <h1 className="font-bold px-3 text-xl">Teams</h1>
                            <TeamsList
                                teams={teams}
                                onSelect={(team) => console.log('Selected:', team)}
                            />
                        </RightPanel>
                    </div>
                </div>

                {/* Mobile Quick Links - only visible on mobile */}
                <div className="md:hidden flex flex-col gap-3 p-4 mt-2 mb-8">
                    <h2 className="font-bold text-lg text-center">Quick Access</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/matchdetails" className="w-full">
                            <button className="w-full flex items-center justify-center gap-2 bg-[#4CAF50] hover:bg-[#3e8e41] text-white py-3 px-4 rounded-lg shadow transition-colors">
                                <Calendar size={18} />
                                <span>Match Details</span>
                            </button>
                        </Link>
                        <Link href="/profile" className="w-full">
                            <button className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg shadow transition-colors">
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
            </div>
        </div>
    );
}
