'use client';

import { useEffect, useState } from 'react';
import MatchCard from "./MatchCard";
import teamService, { Match } from '@/Services/TeamService';

export default function LatestMatches() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchLatestMatches();
    }, []);

    const fetchLatestMatches = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const latestMatches = await teamService.getLatestMatches(5);
            setMatches(latestMatches);
        } catch (error) {
            console.error('Error fetching latest matches:', error);
            setError('Failed to load match data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <section className="mt-8 px-4">
                <h1 className="text-2xl font-semibold mb-4">Latest Matches</h1>
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4CAF50]"></div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="mt-8 px-4">
                <h1 className="text-2xl font-semibold mb-4">Latest Matches</h1>
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
                    <p className="font-medium">Unable to load matches</p>
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={fetchLatestMatches}
                        className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 py-1 px-3 rounded transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </section>
        );
    }

    // Fallback to example matches if API returns empty
    const displayMatches = matches.length > 0 ? matches : [
        { id: '1', homeTeamId: '1', awayTeamId: '2', homeTeam: { id: '1', name: 'Team A' }, awayTeam: { id: '2', name: 'Team B' }, homeScore: 2, awayScore: 1, date: new Date().toISOString(), status: 'completed' as const },
        { id: '2', homeTeamId: '3', awayTeamId: '4', homeTeam: { id: '3', name: 'Team C' }, awayTeam: { id: '4', name: 'Team D' }, homeScore: 0, awayScore: 0, date: new Date().toISOString(), status: 'live' as const },
        { id: '3', homeTeamId: '5', awayTeamId: '6', homeTeam: { id: '5', name: 'Team E' }, awayTeam: { id: '6', name: 'Team F' }, homeScore: 3, awayScore: 2, date: new Date().toISOString(), status: 'completed' as const },
    ];

    return (
        <section className="mt-8 px-4">
            <h1 className="text-2xl font-semibold mb-4">Latest Matches</h1>
            <div className="flex flex-col gap-4">
                {displayMatches.map((match) => (
                    <MatchCard
                        key={match.id}
                        teamA={match.homeTeam?.name || 'Unknown Team'}
                        teamB={match.awayTeam?.name || 'Unknown Team'}
                        scoreA={match.homeScore || 0}
                        scoreB={match.awayScore || 0}
                        status={match.status}
                        date={new Date(match.date)}
                        matchId={match.id}
                    />
                ))}
            </div>
        </section>
    );
}
