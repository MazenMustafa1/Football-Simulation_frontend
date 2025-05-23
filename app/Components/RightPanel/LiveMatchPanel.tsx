'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface StatBarProps {
    leftValue: number;
    rightValue: number;
    label: string;
    leftColor: string;
    rightColor: string;
}

interface LiveMatchPanelProps {
    matchId?: string;
    homeTeam?: {
        name: string;
        logo: string;
    };
    awayTeam?: {
        name: string;
        logo: string;
    };
    homeScore?: number;
    awayScore?: number;
    stats?: Array<{
        label: string;
        homeValue: number;
        awayValue: number;
    }>;
    matchTime?: string;
}

const StatBar = ({ leftValue, rightValue, label, leftColor, rightColor }: StatBarProps) => {
    const total = leftValue + rightValue || 1;
    const leftPercent = (leftValue / total) * 100;
    const rightPercent = (rightValue / total) * 100;

    return (
        <div className="w-full text-xs my-2">
            <div className="flex justify-between items-center mb-1 px-2 text-gray-600 font-medium">
                <span>{leftValue}</span>
                <span>{label}</span>
                <span>{rightValue}</span>
            </div>
            <div className="flex h-2 w-full overflow-hidden rounded bg-gray-200">
                <div style={{ width: `${leftPercent}%`, backgroundColor: leftColor }} />
                <div style={{ width: `${rightPercent}%`, backgroundColor: rightColor }} />
            </div>
        </div>
    );
};

export default function LiveMatchPanel({
    homeTeam = { name: 'Team A', logo: '/logos/barcelona.png' },
    awayTeam = { name: 'Team B', logo: '/logos/real madrid.png' },
    homeScore = 0,
    awayScore = 0,
    stats = [
        { label: 'Possession', homeValue: 50, awayValue: 50 },
        { label: 'Shots on Target', homeValue: 5, awayValue: 3 },
        { label: 'Shots', homeValue: 10, awayValue: 7 }
    ],
    matchTime = '00:00'
}: LiveMatchPanelProps) {
    const [isLoading, setIsLoading] = useState(false);

    // This would be replaced with actual API call in a real implementation
    useEffect(() => {
        // Fetch live match data if matchId is provided
    }, []);

    if (isLoading) {
        return (
            <div className="p-4 w-full max-w-sm mx-auto text-center">
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4CAF50]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 w-full max-w-sm mx-auto text-center">
            <p className="text-green-500 text-sm mb-2">{matchTime}</p>

            <div className="flex justify-between items-center mb-3">
                <div className="flex flex-col items-center">
                    <Image
                        src={homeTeam.logo}
                        alt={homeTeam.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                    <span className="text-xs mt-1">{homeTeam.name}</span>
                </div>
                <div className="text-lg font-bold bg-gray-100 px-4 py-1 rounded-full">
                    {homeScore} - {awayScore}
                </div>
                <div className="flex flex-col items-center">
                    <Image
                        src={awayTeam.logo}
                        alt={awayTeam.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                    <span className="text-xs mt-1">{awayTeam.name}</span>
                </div>
            </div>

            {stats.map((stat, index) => (
                <StatBar
                    key={index}
                    label={stat.label}
                    leftValue={stat.homeValue}
                    rightValue={stat.awayValue}
                    leftColor="#fbbf24"
                    rightColor="#4ade80"
                />
            ))}
        </div>
    );
}
