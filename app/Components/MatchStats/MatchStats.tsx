import React from 'react';
import Image from 'next/image';
import { LogoBackground } from "@/app/Components/Logo3d/logo3d";

interface MatchStatsProps {
    teamA: {
        name: string;
        stats: (string | number)[];
        color: string;
        logoUrl: string;
    };
    teamB: {
        name: string;
        stats: (string | number)[];
        color: string;
        logoUrl: string;
    };
    labels: string[];
}

export const MatchStats: React.FC<MatchStatsProps> = ({ teamA, teamB, labels }) => {
    return (
        <div className="flex items-center justify-center gap-6 w-full max-w-6xl mx-auto p-4">


            {/* Stats block (center) */}
            <div className="flex-1 bg-black/60 p-6 rounded-xl relative z-10">
                {/* Team logos */}
                <div className="grid grid-cols-3 gap-6 text-center mb-2">
                    <div className="text-left font-bold">
                        <Image
                            src={teamA.logoUrl}
                            alt={teamA.name}
                            width={45}
                            height={45}
                        />
                    </div>
                    <div></div>
                    <div className="text-right font-bold">
                        <Image
                            src={teamB.logoUrl}
                            alt={teamB.name}
                            width={45}
                            height={45}
                        />
                    </div>
                </div>

                {/* Team names */}
                <div className="grid grid-cols-3 gap-6 text-center mb-4">
                    <div className="text-white text-left font-bold">{teamA.name}</div>
                    <div></div>
                    <div className="text-white text-right font-bold">{teamB.name}</div>
                </div>

                {/* Stats rows */}
                {labels.map((label, index) => (
                    <div
                        key={label}
                        className="grid grid-cols-3 items-center my-2 text-center"
                    >
                        <div
                            className="text-left font-bold px-2 rounded-full"
                            style={{ color: 'white', backgroundColor: teamA.color }}
                        >
                            {teamA.stats[index]}
                        </div>

                        <div className="text-sm text-white">{label}</div>

                        <div
                            className="text-right font-bold px-2 rounded-full"
                            style={{ color: 'white', backgroundColor: teamB.color }}
                        >
                            {teamB.stats[index]}
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};
