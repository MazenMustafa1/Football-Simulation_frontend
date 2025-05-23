'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { ChevronFirst, ChevronLast, LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import authService from '@/Services/AuthenticationService';

interface SidebarProps {
    children: ReactNode;
}

interface SidebarContextType {
    expanded: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export default function Sidebar({ children }: SidebarProps) {
    const [expanded, setExpanded] = useState(true);

    const router = useRouter();

    const handleLogout = () => {
        authService.logout();
        router.push('/login');
    };

    return (
        <aside className="h-full sticky top-0">
            <nav className="h-full flex flex-col bg-white border-r shadow-md dark:bg-gray-800 dark:border-gray-700 transition-all duration-300">
                {/* Sidebar Header */}
                <div className="p-4 pb-2 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <div className={`overflow-hidden transition-all ${expanded ? 'w-10' : 'w-0'}`}>
                            <div className="w-10 h-10 rounded-full bg-[#4CAF50]/10 flex items-center justify-center">
                                <Link href={"/home"}>
                                <Image
                                    src="https://t4.ftcdn.net/jpg/02/11/51/53/240_F_211515361_bnIbyKadClzn3hJT0zCPPuPApcG7k3lC.jpg"
                                    width={30}
                                    height={30}
                                    className="rounded-full"
                                    alt="Logo"
                                />
                                </Link>
                            </div>
                        </div>
                        <h1 className={`font-bold text-xl text-gray-800 dark:text-white transition-all duration-300 ${expanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                            Footex
                        </h1>
                    </div>

                    <button
                        onClick={() => setExpanded((prev) => !prev)}
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                    >
                        {expanded ? <ChevronFirst className="text-gray-500" /> : <ChevronLast className="text-gray-500" />}
                    </button>
                </div>

                <SidebarContext.Provider value={{ expanded }}>
                    {/* Main Menu Section */}
                    <div className="flex-1 flex flex-col overflow-y-auto">
                        <div className="px-3 py-2">
                            {expanded && <p className="px-4 text-xs font-semibold text-gray-400 uppercase mt-2 mb-2">Main Menu</p>}
                            <ul className="space-y-1">
                                {children}
                            </ul>
                        </div>
                    </div>

                    {/* User Profile Section */}
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center gap-2">
                            <Image
                                src="/images/Messi shooting.png"
                                width={36}
                                height={36}
                                className="rounded-full border-2 border-[#4CAF50]"
                                alt="User Avatar"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/logos/barcelona.png';
                                }}
                            />

                            {expanded && (
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Footex User</span>
                                    <span className="text-xs text-gray-500 truncate">user@footex.com</span>
                                </div>
                            )}

                            {expanded && (
                                <button
                                    onClick={handleLogout}
                                    className="ml-auto p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500"
                                >
                                    <LogOut size={18} />
                                </button>
                            )}
                        </div>
                    </div>
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
