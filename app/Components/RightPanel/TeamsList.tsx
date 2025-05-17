'use client';

import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

interface Team {
    id: number;
    name: string;
    logoUrl: string;
}

interface TeamsListProps {
    teams: Team[];
    onSelect?: (team: Team) => void;
}

export default function TeamsList({ teams, onSelect }: TeamsListProps) {
    return (
        <div className="p-4 space-y-2">
            {teams.map((team) => (
                <div
                    key={team.id}
                    onClick={() => onSelect?.(team)}
                    className="flex items-center justify-between px- py-2 rounded-lg bg-white  hover:bg-gray-100 cursor-pointer transition"
                >
                    <div className="flex items-center space-x-3">
                        <Image
                            src={team.logoUrl}
                            alt={team.name}
                            width={32}
                            height={32}
                            className="rounded-full"
                        />
                        <span className="text-sm font-medium">{team.name}</span>
                    </div>
                    <ChevronRight className="text-gray-400" />
                </div>
            ))}
        </div>
    );
}
