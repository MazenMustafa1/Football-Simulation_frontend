'use client';

import { ReactNode } from 'react';
import { useSidebarContext } from './Sidebar';

interface SidebarItemProps {
    icon: ReactNode;
    text: string;
    active?: boolean;
    alert?: boolean;
}

export function SidebarItem({ icon, text, active, alert }: SidebarItemProps) {
    const { expanded } = useSidebarContext();

    return (
        <li className={`
            relative flex items-center py-2.5 px-3 my-1
            font-medium rounded-md cursor-pointer
            transition-colors group
            ${active 
                ? 'bg-gradient-to-tr from-[#4CAF50]/50 to-[#4CAF50]/20 text-[#2e7d32] dark:text-white' 
                : 'hover:bg-[#4CAF50]/10 text-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'}
        `}>
            <span className="inline-block text-lg">
                {icon}
            </span>

            <span className={`overflow-hidden transition-all whitespace-nowrap ${
                expanded ? 'ml-3 w-52' : 'w-0'
            }`}>
                {text}
            </span>

            {alert && (
                <div className={`absolute right-2 w-2 h-2 rounded-full bg-red-500 ${
                    expanded ? '' : 'top-2'
                }`}/>
            )}

            {!expanded && (
                <div className={`
                    absolute left-full rounded-md px-2 py-1 ml-6
                    bg-[#4CAF50]/10 text-gray-800 dark:bg-gray-700 dark:text-white
                    text-sm whitespace-nowrap
                    invisible opacity-0 -translate-x-3 
                    group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
                    transition-all duration-200
                `}>
                    {text}
                </div>
            )}
        </li>
    );
}
