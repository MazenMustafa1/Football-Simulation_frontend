'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { ChevronFirst, ChevronLast, MoreVertical } from 'lucide-react';
import Image from 'next/image';

interface SidebarProps {
    children: ReactNode;
}

interface SidebarContextType {
    expanded: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export default function Sidebar({ children }: SidebarProps) {
    const [expanded, setExpanded] = useState(true);

    return (
        <aside className="h-screen">
            <nav className="h-full flex flex-col bg-white  shadow-sm">
                <div className="p-4 pb-2 flex justify-between items-center">
                    <div className="flex items-center py-4">
                        <Image
                            src="https://t4.ftcdn.net/jpg/02/11/51/53/240_F_211515361_bnIbyKadClzn3hJT0zCPPuPApcG7k3lC.jpg"
                            width={128}
                            height={32}
                            className={`overflow-hidden transition-all ${expanded ? 'w-10' : 'w-0'}`}
                            alt="Logo"
                        />
                        <h1 className="font-bold px-3 text-xl">Simulator</h1>
                    </div>

                    <button
                        onClick={() => setExpanded((prev) => !prev)}
                        className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
                    >
                        {expanded ? <ChevronFirst /> : <ChevronLast />}
                    </button>
                </div>

                <SidebarContext.Provider value={{ expanded }} >
                    <ul className="flex-1 px-3 space-y-1 py-5">{children}</ul>
                </SidebarContext.Provider>


            </nav>
        </aside>
    );
}

export function useSidebarContext() {
    const context = useContext(SidebarContext);
    if (!context) throw new Error('useSidebarContext must be used inside <Sidebar>');
    return context;
}
