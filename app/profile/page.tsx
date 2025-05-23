'use client';

import { ProfileCard } from '@/app/Components/ProfileCard/ProfileCard';
import Sidebar from '@/app/Components/Sidebar/Sidebar';
import { SidebarItem } from '@/app/Components/Sidebar/SidebarItem';
import { Calendar, ClubIcon, LayoutDashboardIcon, LogOutIcon, Package, Settings } from 'lucide-react';
import Navbar from '@/app/Components/Navbar/Navbar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import authService, { UserProfile, UpdateUserRequest } from '@/Services/AuthenticationService';
import './profile.css';

// Number of footballs to animate in the background
const FOOTBALL_COUNT = 5;

interface UserStorage {
    userId: string;
    username: string;
    email: string;
    accessToken: string;
    refreshToken: string;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!authService.isAuthenticated()) {
                    console.log("User not authenticated, redirecting to login");
                    router.push('/login');
                    return;
                }
                const user: UserStorage = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '') : null;
                if (!user?.userId) {
                    console.log("User ID not found, redirecting to login");
                    router.push('/login');
                    return;
                }
                const userProfile = await authService.getUserProfile(user.userId);
                setProfile(userProfile);
            } catch (err) {
                setError('Failed to load profile.');
                console.error('Profile fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile().then();
    }, [router]);

    const handleLogout = () => {
        authService.logout();
        router.push('/login');
    };

    const handleProfileSave = async (updatedProfile: any, avatarFile?: File) => {
        if (!profile) return {success: false, message: 'No profile loaded'};

        try {
            setSaving(true);

            // First upload avatar if provided
            if (avatarFile) {
                try {
                    const avatarUpdateData: UpdateUserRequest = {
                        Id: profile.userId,
                        Image: avatarFile
                    };
                    const uploadResult = await authService.updateProfile(avatarUpdateData);

                    // Update the profile with the new image URL if upload was successful
                    if (uploadResult && uploadResult.imageUrl) {
                        // Update local state with the new image URL from Azure storage
                        setProfile(prev => prev ? {
                            ...prev,
                            imageUrl: uploadResult.imageUrl
                        } : null);
                    }
                } catch (error) {
                    console.error('Avatar upload error:', error);
                    return {success: false, message: 'Failed to upload avatar image.'};
                }
            }

            // Then update other profile fields if changed
            const updateData = {
                username: updatedProfile.username !== profile.username ? updatedProfile.username : undefined,
                email: updatedProfile.email !== profile.email ? updatedProfile.email : undefined,
                favoriteTeamId: updatedProfile.favoriteTeamId !== profile.favoriteTeamId ? updatedProfile.favoriteTeamId : undefined,
                age: updatedProfile.age !== profile.age ? updatedProfile.age : undefined,
                gender: updatedProfile.gender !== profile.gender ? updatedProfile.gender : undefined,
            };

            // Only include fields that have changed
            const filteredUpdateData: UpdateUserRequest = {
                Id: profile.userId,
                ...Object.fromEntries(
                    Object.entries(updateData).filter(([_, v]) => v !== undefined)
                )
            }

            // Only send update request if there are changes
            if (Object.keys(filteredUpdateData).length > 1) {
                console.log(filteredUpdateData)
                await authService.updateProfile(filteredUpdateData);

                // Refresh profile data after update
                if (profile.userId) {
                    const refreshedProfile = await authService.getUserProfile(profile.userId);
                    setProfile(refreshedProfile);
                }
            }

            return {success: true};
        } catch (error: any) {
            console.error('Profile update error:', error);
            return {
                success: false,
                message: error.message || 'Failed to update profile.'
            };
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="profile-page-container min-h-screen relative overflow-hidden">
            {/* Replace existing background with football field */}
            <div className="profile-background fixed inset-0 z-0">
                <div className="football-field-bg">
                    {/* Field lines */}
                    <div className="field-line"></div>
                    <div className="center-circle"></div>
                    <div className="penalty-box-top"></div>
                    <div className="penalty-box-bottom"></div>
                    <div className="goal-top"></div>
                    <div className="goal-bottom"></div>

                    {/* Animated footballs */}
                    {[...Array(FOOTBALL_COUNT)].map((_, i) => (
                        <motion.div
                            key={`ball-${i}`}
                            className="football"
                            initial={{
                                x: Math.random() * window.innerWidth,
                                y: Math.random() * window.innerHeight,
                            }}
                            animate={{
                                x: [
                                    Math.random() * window.innerWidth,
                                    Math.random() * window.innerWidth,
                                    Math.random() * window.innerWidth,
                                ],
                                y: [
                                    Math.random() * window.innerHeight,
                                    Math.random() * window.innerHeight,
                                    Math.random() * window.innerHeight,
                                ],
                                rotate: [0, 360, 720],
                            }}
                            transition={{
                                duration: 20 + Math.random() * 10,
                                ease: "linear",
                                repeat: Infinity,
                                repeatType: "reverse",
                            }}
                        />
                    ))}
                </div>

                {/* Overlay to soften the background */}
                <div className="absolute inset-0 bg-white bg-opacity-40"></div>
            </div>

            <div className="flex flex-col md:flex-row min-h-screen relative z-10">
                <AnimatePresence>
                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <Sidebar>
                            {/* Fixed nested anchor issue by using div wrappers with onClick */}
                            <div onClick={() => router.push('/dashboard')}>
                                <SidebarItem icon={<LayoutDashboardIcon size={20}/>} text="Dashboard"/>
                            </div>
                            <div onClick={() => router.push('/teams')}>
                                <SidebarItem icon={<ClubIcon size={20}/>} text="Teams"/>
                            </div>
                            <div onClick={() => router.push('/schedule')}>
                                <SidebarItem icon={<Calendar size={20}/>} text="Schedule"/>
                            </div>
                            <div onClick={() => router.push('/products')}>
                                <SidebarItem icon={<Package size={20}/>} text="Products" alert/>
                            </div>
                            <div onClick={() => router.push('/settings')}>
                                <SidebarItem icon={<Settings size={20}/>} text="Settings"/>
                            </div>
                            <div onClick={handleLogout}>
                                <SidebarItem icon={<LogOutIcon size={20}/>} text="Logout"/>
                            </div>
                        </Sidebar>
                    </motion.div>
                </AnimatePresence>

                <div className="w-full">
                    <AnimatePresence>
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                        >
                            <Navbar/>
                        </motion.div>
                    </AnimatePresence>

                    <AnimatePresence>
                        {loading ? (
                            <motion.div
                                className="flex justify-center items-center h-[80vh]"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="loader">
                                    <svg viewBox="0 0 80 80">
                                        <circle cx="40" cy="40" r="32" className="loader-circle-bg"></circle>
                                        <circle cx="40" cy="40" r="32" className="loader-circle"></circle>
                                    </svg>
                                </div>
                            </motion.div>
                        ) : error ? (
                            <motion.div
                                className="flex flex-col justify-center items-center h-[80vh] px-4"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.4 }}
                            >
                                <div className="error-icon mb-4">❌</div>
                                <div className="text-red-500 mb-4 font-medium text-center">{error}</div>
                                <motion.button
                                    onClick={() => router.push('/login')}
                                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 shadow-md hover:shadow-lg transition-all"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Return to Login
                                </motion.button>
                            </motion.div>
                        ) : profile ? (
                            <motion.div
                                className="flex flex-col items-center justify-center p-4 my-4 md:my-8"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <div className="profile-card-container">
                                    <ProfileCard
                                        initialProfile={{
                                            avatarUrl: profile.imageUrl || '/default-avatar.jpeg',
                                            username: profile.username,
                                            email: profile.email,
                                            age: profile.age,
                                            gender: profile.gender,
                                            favoriteTeam: profile.favoriteTeamName,
                                            favoriteTeamId: profile.favoriteTeamId,
                                        }}
                                        onProfileSave={handleProfileSave}
                                        isLoading={saving}
                                    />
                                </div>

                                <motion.div
                                    className="mt-8 mb-8"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <div onClick={() => router.push('/dashboard')}>
                                        <motion.button
                                            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg shadow-md flex items-center space-x-2 hover:shadow-lg transition-all"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <LayoutDashboardIcon size={18} />
                                            <span>Back to Dashboard</span>
                                        </motion.button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
