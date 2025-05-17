'use client';
import React, { useState } from 'react';
import {MatchStats} from "@/app/Components/MatchStats/MatchStats";
import Sidebar from "@/app/Components/Sidebar/Sidebar";
import {SidebarItem} from "@/app/Components/Sidebar/SidebarItem";
import {Calendar, ClubIcon, LayoutDashboardIcon, LogOutIcon, Package, Settings} from "lucide-react";
import Navbar from "@/app/Components/Navbar/Navbar";
import DashboardImage from "@/app/Components/DashboardImage/DashboardImage";
import LatestMatches from "@/app/Components/LatestMatches/LatestMatches";
import RightPanel from "@/app/Components/RightPanel/RightPanel";
import LiveMatchPanel from "@/app/Components/RightPanel/LiveMatchPanel";
import TeamsList from "@/app/Components/RightPanel/TeamsList";
import {LogoBackground} from "@/app/Components/Logo3d/logo3d";

export default function matchstats(){
    const [activeTab, setActiveTab] = useState<'stats' | 'lineup'>('stats');

    return(
        <div className="flex">
            <Sidebar>
                <SidebarItem icon={<LayoutDashboardIcon size={20} />} text="Dashboard" />
                <SidebarItem icon={<ClubIcon size={20} />} text="Teams" />
                <SidebarItem icon={<Calendar size={20} />} text="Schedule" />
                <SidebarItem icon={<Package size={20} />} text="Products" alert />
                <SidebarItem icon={<Settings size={20} />} text="Settings" />
                <SidebarItem icon={<LogOutIcon size={20} />} text="Logout" />
            </Sidebar>
            <div className="w-full" style={{
                backgroundImage: "url('/images/greenPitch.jpg')",
                backgroundSize: 'cover',         // Ensures the image covers the div
                backgroundPosition: 'center',    // Centers the image
                backgroundRepeat: 'no-repeat',   // Prevents tiling
            }}>
                <Navbar></Navbar>

                <div className="absolute inset-0 z-0 flex justify-between opacity-90 ">
                    <div className="w-1/2 relative ml-16 mt-10">
                        <LogoBackground logoUrl={"/logos/barcelona.png"} />
                    </div>

                </div>

                <div className="py-10 w-full max-w-2xl mx-auto">
                    {/* ── Tabs nav ── */}
                    <div className="flex space-x-4 mb-6 justify-center">
                        <button
                            onClick={() => setActiveTab('stats')}
                            className={`
                                cursor-pointer
                                px-4 py-2 border-b-2 font-medium
                                transition-colors duration-200 ease-in-out
                                active:scale-95
                                focus:outline-none
                                ${
                                activeTab === 'stats'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                            >
                            Stats
                        </button>

                        <button
                            onClick={() => setActiveTab('lineup')}
                            className={`
                                cursor-pointer
                                px-4 py-2 border-b-2 font-medium
                                transition-colors duration-200 ease-in-out
                                active:scale-95
                                focus:outline-none
                                ${
                                    activeTab === 'lineup'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                 }
                           `}
                            >
                                Lineup
                        </button>
                    </div>

                    {/* ── Tabs content ── */}
                    {activeTab === 'stats' ? (
                        <MatchStats
                            teamA={{
                                name: 'Barcelona',
                                stats: [23, 9, '63%', 478, '87%', 17, 4, 0, 1, 10],
                                color: '#e91e63',
                                logoUrl:
                                    "/logos/barcelona.png",
                            }}
                            teamB={{
                                name: 'Real Madrid',
                                stats: [9, 5, '37%', 295, '79%', 15, 3, 0, 5, 2],
                                color: '#1e88e5',
                                logoUrl:
                                    '/logos/real madrid.png',
                            }}
                            labels={[
                                'Shots',
                                'Shots on target',
                                'Possession',
                                'Passes',
                                'Pass accuracy',
                                'Fouls',
                                'Yellow cards',
                                'Red cards',
                                'Offsides',
                                'Corners',
                            ]}
                        />
                    ) : (
                        <h1 className="text-2xl font-semibold text-center">Hello</h1>
                    )}
                </div>

                <div className="absolute inset-0 z-0 flex justify-between opacity-90 pointer-events-none">
                    <div className="w-1/2 relative ml-310 mt-5">
                        <LogoBackground logoUrl={"/logos/real madrid.png"} />
                    </div>

                </div>


                {/*<div className=" w-210" >*/}
                {/*    */}
                {/*</div>*/}

            </div>



            {/*<main className="flex-1 bg-gray-50 p-6">{children}</main>*/}
        </div>


    )
}