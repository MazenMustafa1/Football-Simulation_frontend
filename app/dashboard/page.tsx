'use client';
import axios from 'axios';
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

export default function dashboard() {
    const [teams, setTeams] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        fetchTeams();
        checkAdmin();
    }, []);

    const fetchTeams = async () => {
        try {
            const response = await axios.get('https://localhost:7082/api/teams');
            setTeams(response.data);
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };

    const checkAdmin = () => {
        // Placeholder logic for checking if the user is an admin
        const userRole = localStorage.getItem('userRole');
        setIsAdmin(userRole === 'admin');
    };

    return (
        <div className="flex">
            <Sidebar>
                <Link href="/dashboard">
                    <SidebarItem icon={<LayoutDashboardIcon size={20} />} text="Dashboard" />
                </Link>
                <Link href="/teams">
                    <SidebarItem icon={<ClubIcon size={20} />} text="Teams" />
                </Link>
                <Link href="/schedule">
                    <SidebarItem icon={<Calendar size={20} />} text="Schedule" />
                </Link>
                <Link href="/products">
                    <SidebarItem icon={<Package size={20} />} text="Products" alert />
                </Link>
                <Link href="/settings">
                    <SidebarItem icon={<Settings size={20} />} text="Settings" />
                </Link>
                <Link href="/logout">
                    <SidebarItem icon={<LogOutIcon size={20} />} text="Logout" />
                </Link>
                <Link href="/notifications">
                    <SidebarItem icon={<Bell size={20} />} text="Notifications" />
                </Link>
                <Link href="/coaches">
                    <SidebarItem icon={<Users size={20} />} text="Coaches" />
                </Link>
                <Link href="/players">
                    <SidebarItem icon={<User size={20} />} text="Players" />
                </Link>
                <Link href="/stadiums">
                    <SidebarItem icon={<Home size={20} />} text="Stadiums" />
                </Link>
                <Link href="/search">
                    <SidebarItem icon={<Search size={20} />} text="Search" />
                </Link>
            </Sidebar>
            <div className="w-full">
                <Navbar></Navbar>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Main Content (Photo + Match Cards) */}
                    <div className="md:col-span-2">
                        <DashboardImage></DashboardImage>
                        <LatestMatches></LatestMatches>
                    </div>

                    {/* Right Sidebar */}
                    <div className="hidden md:block">
                        <RightPanel>
                            <LiveMatchPanel></LiveMatchPanel>
                            <h1 className="font-bold px-3 text-xl">Teams</h1>
                            <TeamsList
                                teams={teams}
                                // onSelect={(team) => console.log('Selected:', team)}
                            />
                        </RightPanel>
                    </div>
                </div>

                <div className="flex justify-center mt-8">
                    <Link href="/matchdetails">
                        <button className="btn btn-primary mx-2">Match Details</button>
                    </Link>
                    <Link href="/profile">
                        <button className="btn btn-secondary mx-2">Profile</button>
                    </Link>
                </div>

                {isAdmin && (
                    <div className="flex justify-center mt-8">
                        <Link href="/admin">
                            <button className="btn btn-warning mx-2">Admin Dashboard</button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
