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


const teams = [
    { id: 1, name: 'Barcelona', logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVfk7_90kgqNqEZ-qSQ1VRBzLRCqVNTs0auQ&s' },
    { id: 2, name: 'Real Madrid', logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQG-h7cChu-bbPejKnHSQrNS0MEtzsrO4el2Q&s' },
];

export default function Home() {
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

                {/*<div className=" w-210" >*/}
                {/*    */}
                {/*</div>*/}

            </div>



            {/*<main className="flex-1 bg-gray-50 p-6">{children}</main>*/}
        </div>
    );
}
