'use client';

import Image from 'next/image';

interface StatBarProps {
    leftValue: number;
    rightValue: number;
    label: string;
    leftColor: string;
    rightColor: string;
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

export default function LiveMatchPanel() {
    return (
        <div className="p-4 w-full max-w-sm mx-auto text-center">

            <p className="text-green-500 text-sm mb-2">62 : 24</p>

            <div className="flex justify-between items-center mb-3">
                <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVfk7_90kgqNqEZ-qSQ1VRBzLRCqVNTs0auQ&s" alt="Team A" width={40} height={40} />
                <div className="text-lg font-bold bg-gray-100 px-4 py-1 rounded-full">2 - 2</div>
                <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQG-h7cChu-bbPejKnHSQrNS0MEtzsrO4el2Q&s" alt="Team B" width={40} height={40} />
            </div>

            <StatBar label="Shoot on Target" leftValue={7} rightValue={3} leftColor="#fbbf24" rightColor="#4ade80" />
            <StatBar label="Shoot" leftValue={12} rightValue={1} leftColor="#fbbf24" rightColor="#4ade80" />
            <StatBar label="Fouls" leftValue={7} rightValue={3} leftColor="#fbbf24" rightColor="#4ade80" />
        </div>
    );
}
