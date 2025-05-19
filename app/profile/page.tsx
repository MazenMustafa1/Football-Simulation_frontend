import {ProfileCard} from "@/app/Components/ProfileCard/ProfileCard";
import Sidebar from "@/app/Components/Sidebar/Sidebar";
import {SidebarItem} from "@/app/Components/Sidebar/SidebarItem";
import {Calendar, ClubIcon, LayoutDashboardIcon, LogOutIcon, Package, Settings} from "lucide-react";
import Navbar from "@/app/Components/Navbar/Navbar";
import Link from 'next/link';

export default function ProfilePage() {
    return (
        <div className="flex">
            <Sidebar>
                <SidebarItem icon={<LayoutDashboardIcon size={20} />} text="Dashboard" />
                <SidebarItem icon={<ClubIcon size={20} />} text="Teams" />
                <SidebarItem icon={<Calendar size={20} />} text="Schedule" />
                <SidebarItem icon={<Package size={20} />} text="Products" alert />
                <SidebarItem icon={<Settings size={20} />} text="Settings" />
                <SidebarItem icon={<LogOutIcon size={20} />} text="Logout" />
            </Sidebar>
            <div className="w-full">
                <Navbar></Navbar>

                <div className="my-20 flex items-center justify-center p-4">
                    <ProfileCard
                        initialProfile={{
                            avatarUrl: 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp',
                            username: 'John Monroe',
                            email: 'john@figma.com',
                            age: 32,
                            gender: 'Male',
                        }}
                    />
                </div>

                <div className="flex justify-center mt-8">
                    <Link href="/dashboard">
                        <button className="btn btn-primary mx-2">Back to Dashboard</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
