'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MatchStats } from '@/app/Components/MatchStats/MatchStats';
import Sidebar, { SidebarLayout } from '@/app/Components/Sidebar/Sidebar';
import { SidebarItem } from '@/app/Components/Sidebar/SidebarItem';
import {
  Calendar,
  ClubIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  Package,
  Settings,
} from 'lucide-react';
import Navbar from '@/app/Components/Navbar/Navbar';
import DashboardImage from '@/app/Components/DashboardImage/DashboardImage';
import LatestMatches from '@/app/Components/LatestMatches/LatestMatches';
import RightPanel from '@/app/Components/RightPanel/RightPanel';
import LiveMatchPanel from '@/app/Components/RightPanel/LiveMatchPanel';
import TeamsList from '@/app/Components/RightPanel/TeamsList';
import { LogoBackground } from '@/app/Components/Logo3d/logo3d';
import Link from 'next/link';
import matchService, { MatchDetail } from '@/Services/MatchService';
import authService from '@/Services/AuthenticationService';

function MatchDetailsContent() {
  const [activeTab, setActiveTab] = useState<'stats' | 'lineup'>('stats');
  const [matchData, setMatchData] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const searchParams = useSearchParams();
  const matchId = searchParams.get('matchId');

  useEffect(() => {
    const fetchMatchDetails = async () => {
      if (!matchId) {
        setError('No match ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const details = await matchService.getMatchDetails(parseInt(matchId));
        setMatchData(details);
      } catch (err) {
        console.error('Error fetching match details:', err);
        setError('Failed to load match details');
      } finally {
        setLoading(false);
      }
    };

    fetchMatchDetails();
  }, [matchId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-[#4CAF50]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="mb-4 text-red-500">⚠️ {error}</div>
        <Link href="/dashboard">
          <button className="btn btn-primary">Back to Dashboard</button>
        </Link>
      </div>
    );
  }

  return (
    <SidebarLayout
      sidebar={
        <>
          <SidebarItem
            icon={<LayoutDashboardIcon size={20} />}
            text="Dashboard"
          />
          <SidebarItem icon={<ClubIcon size={20} />} text="Teams" />
          <SidebarItem icon={<Calendar size={20} />} text="Schedule" />
          <SidebarItem icon={<Package size={20} />} text="Products" alert />
          <SidebarItem icon={<Settings size={20} />} text="Settings" />
          <SidebarItem icon={<LogOutIcon size={20} />} text="Logout" />
        </>
      }
    >
      <div
        className="relative min-h-screen w-full flex-1"
        style={{
          backgroundImage: "url('/images/greenPitch.jpg')",
          backgroundSize: 'cover', // Ensures the image covers the div
          backgroundPosition: 'center', // Centers the image
          backgroundRepeat: 'no-repeat', // Prevents tiling
        }}
      >
        <Navbar></Navbar>

        <div className="absolute inset-0 z-0 flex justify-between opacity-90">
          <div className="relative mt-10 ml-8 w-1/2">
            <LogoBackground
              logoUrl={matchData?.homeTeam.logo || '/logos/barcelona.png'}
            />
          </div>
        </div>

        {/* Live Match Panel */}
        <div className="absolute top-20 right-8 z-10 w-80">
          <RightPanel title="Live Match">
            <LiveMatchPanel
              userId={authService.getCurrentUserId() || undefined}
            />
          </RightPanel>
        </div>

        <div className="mx-auto w-full max-w-2xl py-10">
          {/* ── Tabs nav ── */}
          <div className="mb-6 flex justify-center space-x-4">
            <button
              onClick={() => setActiveTab('stats')}
              className={`cursor-pointer border-b-2 px-4 py-2 font-medium transition-colors duration-200 ease-in-out focus:outline-none active:scale-95 ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } `}
            >
              Stats
            </button>

            <button
              onClick={() => setActiveTab('lineup')}
              className={`cursor-pointer border-b-2 px-4 py-2 font-medium transition-colors duration-200 ease-in-out focus:outline-none active:scale-95 ${
                activeTab === 'lineup'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } `}
            >
              Lineup
            </button>
          </div>

          {/* ── Tabs content ── */}
          {activeTab === 'stats' ? (
            <MatchStats
              teamA={{
                name:
                  matchData?.homeTeam.shortName ||
                  matchData?.homeTeam.name ||
                  'Barcelona',
                stats: [
                  matchData?.homeTeamShots || 23,
                  matchData?.homeTeamShotsOnTarget || 9,
                  `${matchData?.homeTeamPossession || 63}%`,
                  matchData?.homeTeamPasses || 478,
                  `${matchData?.homeTeamPassAccuracy || 87}%`,
                  matchData?.homeTeamFouls || 17,
                  matchData?.homeTeamYellowCards || 4,
                  matchData?.homeTeamRedCards || 0,
                  matchData?.homeTeamOffsides || 1,
                  matchData?.homeTeamCorners || 10,
                ],
                color: matchData?.homeTeam.primaryColor || '#e91e63',
                logoUrl: matchData?.homeTeam.logo || '/logos/barcelona.png',
              }}
              teamB={{
                name:
                  matchData?.awayTeam.shortName ||
                  matchData?.awayTeam.name ||
                  'Real Madrid',
                stats: [
                  matchData?.awayTeamShots || 9,
                  matchData?.awayTeamShotsOnTarget || 5,
                  `${matchData?.awayTeamPossession || 37}%`,
                  matchData?.awayTeamPasses || 295,
                  `${matchData?.awayTeamPassAccuracy || 79}%`,
                  matchData?.awayTeamFouls || 15,
                  matchData?.awayTeamYellowCards || 3,
                  matchData?.awayTeamRedCards || 0,
                  matchData?.awayTeamOffsides || 5,
                  matchData?.awayTeamCorners || 2,
                ],
                color: matchData?.awayTeam.primaryColor || '#1e88e5',
                logoUrl: matchData?.awayTeam.logo || '/logos/real madrid.png',
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
            <h1 className="text-center text-2xl font-semibold">Hello</h1>
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 z-0 flex justify-between opacity-90">
          <div className="relative mt-5 ml-8 w-1/2">
            <LogoBackground
              logoUrl={matchData?.awayTeam.logo || '/logos/real madrid.png'}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/dashboard">
            <button className="btn btn-primary mx-2">Back to Dashboard</button>
          </Link>
        </div>

        {/*<div className=" w-210" >*/}
        {/*    */}
        {/*</div>*/}
      </div>

      {/*<main className="flex-1 bg-gray-50 p-6">{children}</main>*/}
    </SidebarLayout>
  );
}

export default function MatchDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-green-500"></div>
            <p className="mt-4 text-gray-600">Loading match details...</p>
          </div>
        </div>
      }
    >
      <MatchDetailsContent />
    </Suspense>
  );
}
