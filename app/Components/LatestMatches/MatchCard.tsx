'use client';

import Link from 'next/link';

type MatchCardProps = {
    teamA: string;
    teamB: string;
    scoreA: number;
    scoreB: number;
    status?: 'scheduled' | 'live' | 'completed' | 'cancelled';
    date?: Date;
    matchId?: string;
};

export default function MatchCard({ teamA, teamB, scoreA, scoreB, status = 'completed', date, matchId }: MatchCardProps) {
    // Format date if available
    const formattedDate = date
        ? new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }).format(date)
        : '';

    // Determine status badge style
    const getStatusBadge = () => {
        switch(status) {
            case 'live':
                return <span className="badge badge-sm badge-error animate-pulse">LIVE</span>;
            case 'scheduled':
                return <span className="badge badge-sm badge-info">UPCOMING</span>;
            case 'cancelled':
                return <span className="badge badge-sm badge-warning">CANCELLED</span>;
            case 'completed':
            default:
                return <span className="badge badge-sm badge-success">FINAL</span>;
        }
    };

    return (
        <Link href={matchId ? `/matchdetails/${matchId}` : '/matchdetails'} className="block">
            <div className="list bg-base-100 rounded-box shadow-md hover:shadow-lg transition-shadow">
                <div className="list-row items-center justify-between p-4 gap-4">
                    {/* Team A */}
                    <div className="flex items-center gap-2 px-8">
                        <img className="size-10 rounded-box" src="/logos/barcelona.png" alt={teamA} />
                        <div>
                            <div className="font-semibold">{teamA}</div>
                            <div className="text-xl font-bold">{scoreA}</div>
                        </div>
                    </div>

                    {/* Center - Status and Time */}
                    <div className="flex flex-col items-center">
                        {getStatusBadge()}
                        <div className="text-lg font-bold text-center mt-1">VS</div>
                        {formattedDate && (
                            <div className="text-xs text-gray-500 mt-1">{formattedDate}</div>
                        )}
                    </div>

                    {/* Team B */}
                    <div className="flex items-center gap-2 px-10">
                        <div className="text-right">
                            <div className="font-semibold">{teamB}</div>
                            <div className="text-xl font-bold">{scoreB}</div>
                        </div>
                        <img className="size-10 rounded-box" src="/logos/real madrid.png" alt={teamB} />
                    </div>
                </div>
            </div>
        </Link>
    );
}
