'use client';

import { ReactNode } from 'react';

interface RightPanelProps {
    children: ReactNode;
    title?: string;
}

export default function RightPanel({ children, title = "Updates" }: RightPanelProps) {
    return (
        <aside className="h-screen">
            <nav className="h-full flex flex-col bg-white shadow-sm">
                <div className="p-4 pb-2 flex justify-between items-center">
                    <div className="flex items-center ">
                        <h1 className="font-bold px-3 text-xl">{title}</h1>
                    </div>
                </div>

                <ul className="flex-1 px-3 space-y-1 py-5">{children}</ul>
            </nav>
        </aside>
    );
}
