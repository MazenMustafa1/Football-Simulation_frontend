'use client';

import {ProfileCard} from "@/app/Components/ProfileCard/ProfileCard";
import Sidebar from "@/app/Components/Sidebar/Sidebar";
import {SidebarItem} from "@/app/Components/Sidebar/SidebarItem";
import {Calendar, ClubIcon, LayoutDashboardIcon, LogOutIcon, Package, Settings} from "lucide-react";
import Navbar from "@/app/Components/Navbar/Navbar";
import Link from 'next/link';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const genderOptions = ['Male','Female','Other'];
    const [profile, setProfile] = useState(
        {
            ImageUrl: '',
            Username: '',
            Email: '',
            Age: 0,
            Gender: '',
            FavoriteTeam: '',
        }
    );
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/login');
                    return;
                }

                const response = await axios.get('https://localhost:7082/api/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setProfile(response.data);
            } catch (error) {
                console.error('Error fetching profile:', error);
                router.push('/login');
            }
        };

        fetchProfile();
    }, [router]);

    if (!profile) {
        return <div>Loading...</div>;
    }

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
                            avatarUrl: profile.ImageUrl,
                            username: profile.Username,
                            email: profile.Email,
                            age: profile.Age,
                            gender: genderOptions.includes(profile.Gender) ? profile.Gender as "Male" | "Female" | "Other" : "Other",
                            favoriteTeam: profile.FavoriteTeam,
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





