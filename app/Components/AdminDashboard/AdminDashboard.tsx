'use client';

import React, { useState, useEffect } from 'react';
import TeamManagement from './EntityManagement/TeamManagement';
import StadiumManagement from './EntityManagement/StadiumManagement';
import PlayerManagement from './EntityManagement/PlayerManagement';
import SeasonManagement from './EntityManagement/SeasonManagement';
import CoachManagement from "@/app/Components/AdminDashboard/EntityManagement/CoachManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("teams");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleTabChange = (value: string) => {
        // Ensure we don't set the same tab (prevents unnecessary re-rendering)
        if (activeTab !== value) {
            setActiveTab(value);
        }
    };

    // Prevent clicks inside tab content from bubbling up and causing issues
    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            <div className="container mx-auto p-6 relative">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">Admin Dashboard</h1>
                    <p className="text-gray-300 text-lg">Manage your football data with ease</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700 relative z-20"
                >
                    <Tabs
                        defaultValue="teams"
                        value={activeTab}
                        className="w-full"
                        onValueChange={handleTabChange}
                    >
                        <div className="px-6 pt-6">
                            <TabsList className="grid w-full grid-cols-5 bg-gray-700 rounded-lg p-1">
                                <TabsTrigger
                                    value="teams"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300 relative z-30"
                                    onClick={() => handleTabChange("teams")}
                                >
                                    Teams
                                </TabsTrigger>
                                <TabsTrigger
                                    value="stadiums"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300 relative z-30"
                                    onClick={() => handleTabChange("stadiums")}
                                >
                                    Stadiums
                                </TabsTrigger>
                                <TabsTrigger
                                    value="players"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300 relative z-30"
                                    onClick={() => handleTabChange("players")}
                                >
                                    Players
                                </TabsTrigger>
                                <TabsTrigger
                                    value="seasons"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300 relative z-30"
                                    onClick={() => handleTabChange("seasons")}
                                >
                                    Seasons
                                </TabsTrigger>
                                <TabsTrigger
                                    value="coaches"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300 relative z-30"
                                    onClick={() => handleTabChange("coaches")}
                                >
                                    Coaches
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="p-6 relative z-10"
                                onClick={handleContentClick}
                            >
                                <TabsContent value="teams" className="mt-0 relative z-10">
                                    <TeamManagement />
                                </TabsContent>

                                <TabsContent value="stadiums" className="mt-0 relative z-10">
                                    <StadiumManagement />
                                </TabsContent>

                                <TabsContent value="players" className="mt-0 relative z-10">
                                    <PlayerManagement />
                                </TabsContent>

                                <TabsContent value="seasons" className="mt-0 relative z-10">
                                    <SeasonManagement />
                                </TabsContent>

                                <TabsContent value="coaches" className="mt-0 relative z-10">
                                    <CoachManagement />
                                </TabsContent>
                            </motion.div>
                        </AnimatePresence>
                    </Tabs>
                </motion.div>

                {/* Background decorative elements */}
                <div className="absolute top-40 right-10 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-10 animate-pulse pointer-events-none"></div>
                <div className="absolute bottom-20 left-10 w-80 h-80 bg-green-500 rounded-full filter blur-3xl opacity-10 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>
            </div>
        </div>
    );
};
export default AdminDashboard;

