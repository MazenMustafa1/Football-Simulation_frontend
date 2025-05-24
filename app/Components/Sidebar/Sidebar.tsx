'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { ChevronFirst, ChevronLast, LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import authService from '@/Services/AuthenticationService';

interface SidebarProps {
  children: ReactNode;
}

interface SidebarLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

interface SidebarContextType {
  expanded: boolean;
  isHovered: boolean;
  isCompactMode: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// New SidebarLayout component that provides context to both sidebar and main content
export function SidebarLayout({ sidebar, children }: SidebarLayoutProps) {
  const [expanded, setExpanded] = useState(false); // Start collapsed
  const [isHovered, setIsHovered] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(true); // New compact mode state

  // Keyboard shortcuts for sidebar
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + B to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setExpanded((prev) => !prev);
      }
      // Ctrl/Cmd + Shift + B to toggle compact mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        setIsCompactMode((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <SidebarContext.Provider
      value={{ expanded: expanded || isHovered, isHovered, isCompactMode }}
    >
      <div className="relative flex min-h-screen">
        <SidebarComponent
          expanded={expanded}
          setExpanded={setExpanded}
          isHovered={isHovered}
          setIsHovered={setIsHovered}
          isCompactMode={isCompactMode}
          setIsCompactMode={setIsCompactMode}
        >
          {sidebar}
        </SidebarComponent>
        <div
          className={`hidden flex-1 transition-all duration-300 ease-in-out md:block ${
            expanded || isHovered ? 'ml-64' : isCompactMode ? 'ml-14' : 'ml-16'
          }`}
        >
          {children}
        </div>
        {/* Mobile: full width when sidebar is hidden */}
        <div className="flex-1 md:hidden">{children}</div>
      </div>
    </SidebarContext.Provider>
  );
}

// Original Sidebar component, now renamed to SidebarComponent for internal use
interface SidebarComponentProps {
  children: ReactNode;
  expanded: boolean;
  setExpanded: (value: boolean | ((prev: boolean) => boolean)) => void;
  isHovered: boolean;
  setIsHovered: (value: boolean) => void;
  isCompactMode: boolean;
  setIsCompactMode: (value: boolean | ((prev: boolean) => boolean)) => void;
}

function SidebarComponent({
  children,
  expanded,
  setExpanded,
  isHovered,
  setIsHovered,
  isCompactMode,
  setIsCompactMode,
}: SidebarComponentProps) {
  const router = useRouter();

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  const showContent = expanded || isHovered;
  const sidebarWidth = showContent ? 'w-64' : isCompactMode ? 'w-14' : 'w-16';

  return (
    <aside
      className="group fixed top-0 left-0 z-50 hidden h-full transition-all duration-300 ease-in-out md:block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <nav
        className={`flex h-full flex-col border-r border-gray-200/50 bg-white/95 backdrop-blur-sm transition-all duration-300 ease-in-out ${
          showContent ? 'w-64 shadow-2xl' : sidebarWidth + ' shadow-xl'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b border-gray-200/50 p-3">
          <div className="flex min-w-0 items-center gap-3 overflow-hidden">
            <div
              className={`flex flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl ${
                showContent
                  ? 'h-10 w-10'
                  : isCompactMode
                    ? 'h-8 w-8'
                    : 'h-9 w-9'
              }`}
            >
              <Link href={'/home'}>
                <Image
                  src="https://t4.ftcdn.net/jpg/02/11/51/53/240_F_211515361_bnIbyKadClzn3hJT0zCPPuPApcG7k3lC.jpg"
                  width={showContent ? 24 : isCompactMode ? 20 : 22}
                  height={showContent ? 24 : isCompactMode ? 20 : 22}
                  className="rounded-lg transition-transform duration-300 hover:rotate-12"
                  alt="Logo"
                />
              </Link>
            </div>
            <h1
              className={`bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-lg font-bold whitespace-nowrap text-transparent transition-all duration-300 ${
                showContent
                  ? 'w-auto translate-x-0 opacity-100'
                  : 'w-0 -translate-x-4 overflow-hidden opacity-0'
              }`}
            >
              Footex
            </h1>
          </div>

          {showContent && (
            <div className="flex flex-shrink-0 items-center gap-1">
              {/* Compact Mode Toggle */}
              <button
                onClick={() => setIsCompactMode(!isCompactMode)}
                className="rounded-lg bg-gray-100/50 p-1.5 transition-all duration-200 hover:scale-110 hover:bg-gray-200/70"
                title={
                  isCompactMode
                    ? 'Switch to Normal Mode'
                    : 'Switch to Compact Mode'
                }
              >
                <div
                  className={`h-3 w-3 rounded-sm transition-all duration-200 ${
                    isCompactMode ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                ></div>
              </button>

              <button
                onClick={() => setExpanded((prev) => !prev)}
                className="rounded-lg bg-gray-100/50 p-1.5 transition-all duration-200 hover:scale-110 hover:bg-gray-200/70"
              >
                {expanded ? (
                  <ChevronFirst className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronLast className="h-4 w-4 text-gray-600" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Main Menu Section */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div
            className={`px-2 py-3 transition-all duration-300 ${isCompactMode && !showContent ? 'px-1 py-2' : ''}`}
          >
            {showContent && (
              <p className="mb-3 flex items-center justify-between px-3 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase">
                <span>Main Menu</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs ${
                    isCompactMode
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {isCompactMode ? 'Compact' : 'Normal'}
                </span>
              </p>
            )}
            <ul className="space-y-1">{children}</ul>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="border-t border-gray-200/50 p-3">
          <div className="-m-2 flex items-center gap-3 rounded-lg p-2 transition-all duration-300 hover:bg-gray-50/50">
            <div className="relative">
              <Image
                src="/images/Messi shooting.png"
                width={32}
                height={32}
                className="rounded-full border-2 border-green-400 shadow-sm transition-all duration-300 hover:scale-110"
                alt="User Avatar"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/logos/barcelona.png';
                }}
              />
              <div className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full border-2 border-white bg-green-400"></div>
            </div>

            {showContent && (
              <>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-semibold text-gray-800">
                    Footex User
                  </span>
                  <span className="truncate text-xs text-gray-500">
                    user@footex.com
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="rounded-lg p-1.5 text-gray-500 transition-all duration-200 hover:scale-110 hover:bg-red-50 hover:text-red-600"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Hover Indicator - Enhanced */}
        {!showContent && (
          <>
            <div className="absolute top-1/2 right-0 h-16 w-1 -translate-y-1/2 rounded-l-full bg-gradient-to-b from-green-400 to-emerald-500 opacity-30"></div>
            <div className="absolute top-1/2 right-0 h-8 w-0.5 -translate-y-1/2 animate-pulse rounded-l-full bg-gradient-to-b from-green-300 to-emerald-400 opacity-50"></div>

            {/* Quick expand button for compact mode */}
            {isCompactMode && (
              <button
                onClick={() => setExpanded(true)}
                className="absolute top-1/2 -right-2 h-6 w-6 -translate-y-1/2 rounded-full bg-green-500 text-white opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 hover:scale-110 hover:bg-green-600"
              >
                <ChevronLast className="ml-0.5 h-3 w-3" />
              </button>
            )}
          </>
        )}
      </nav>
    </aside>
  );
}

// Main Sidebar component for backward compatibility
export default function Sidebar({ children }: SidebarProps) {
  return (
    <SidebarLayout sidebar={children}>
      {/* Default empty content for backward compatibility */}
      <div className="flex-1"></div>
    </SidebarLayout>
  );
}

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context)
    throw new Error('useSidebarContext must be used inside <SidebarLayout>');
  return context;
}
