'use client';

import { useEffect, useState } from 'react';
import MatchCard from "./MatchCard";
import matchService, { Match } from '@/Services/MatchService';

interface StorageUser {
    userId: string;
    roles: [string];
}

export default function LatestMatches() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchLatestMatches().then( );
    }, []);

    const fetchLatestMatches = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const userData = localStorage.getItem('user');
            const user: StorageUser = userData ? JSON.parse(userData) : { userId: '', roles: [''] };
            const latestMatches = await matchService.getLatestMatches(user.userId);
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

    if (matches.length === 0) {
        return (
            <section className="mt-8 px-4">
                <h1 className="text-2xl font-semibold mb-4">Latest Matches</h1>
                <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded">
                    <p className="font-medium">No matches found</p>
                    <p className="text-sm">There are currently no matches to display.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="mt-8 px-4">
            <h1 className="text-2xl font-semibold mb-4">Latest Matches</h1>
            <div className="flex flex-col gap-4">
                {matches.map((match) => (
                    <MatchCard
                        key={match.id}
                        teamA={match.homeTeamName || 'Unknown Team'}
                        teamB={match.awayTeamName || 'Unknown Team'}
                        scoreA={match.homeTeamScore || 0}
                        scoreB={match.awayTeamScore || 0}
                        status={match.status}
                        date={match.date ? new Date(match.date) : new Date()}
                        matchId={match.id}
                    />
                ))}
            </div>
        </section>
    );
}
