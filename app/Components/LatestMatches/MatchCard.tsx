type MatchCardProps = {
    teamA: string;
    teamB: string;
    scoreA: number;
    scoreB: number;

};

export default function MatchCard({ teamA, teamB, scoreA, scoreB }: MatchCardProps) {
    return (
        <ul className="list bg-base-100 rounded-box shadow-md">
            <li className="list-row items-center justify-between p-4 gap-4">

                {/* Team A */}
                <div className="flex items-center gap-2 px-8">
                    <img className="size-10 rounded-box" src="https://img.daisyui.com/images/profile/demo/1@94.webp" />
                    <div>
                        <div>{teamA}</div>
                        <div className="text-m uppercase font-semibold opacity-60">{scoreA}</div>
                    </div>
                </div>

                {/* VS */}
                <h1 className="text-lg font-bold text-center">VS</h1>

                {/* Team B */}
                <div className="flex items-center gap-2 px-10">
                    <img className="size-10 rounded-box" src="https://img.daisyui.com/images/profile/demo/1@94.webp" />
                    <div>
                        <div>{teamB}</div>
                        <div className="text-s uppercase font-semibold opacity-60">{scoreB}</div>
                    </div>
                </div>

                {/* Optional Action */}
                <button className="btn btn-square btn-ghost">
                    <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                        </g>
                    </svg>
                </button>

                <div className="flex justify-end">
                    <button className="btn btn-sm btn-primary">View Details</button>
                </div>

            </li>
        </ul>
    );
}
