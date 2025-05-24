import React from 'react';
import Image from 'next/image';
import { LogoBackground } from '@/app/Components/Logo3d/logo3d';

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

export const MatchStats: React.FC<MatchStatsProps> = ({
  teamA,
  teamB,
  labels,
}) => {
  return (
    <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-6 p-4">
      {/* Stats block (center) */}
      <div className="relative z-10 flex-1 rounded-xl bg-black/60 p-6">
        {/* Team logos */}
        <div className="mb-2 grid grid-cols-3 gap-6 text-center">
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
        <div className="mb-4 grid grid-cols-3 gap-6 text-center">
          <div className="text-left font-bold text-white">{teamA.name}</div>
          <div></div>
          <div className="text-right font-bold text-white">{teamB.name}</div>
        </div>

        {/* Stats rows */}
        {labels.map((label, index) => (
          <div
            key={label}
            className="my-2 grid grid-cols-3 items-center text-center"
          >
            <div
              className="rounded-full px-2 text-left font-bold"
              style={{ color: 'white', backgroundColor: teamA.color }}
            >
              {teamA.stats[index]}
            </div>

            <div className="text-sm text-white">{label}</div>

            <div
              className="rounded-full px-2 text-right font-bold"
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
