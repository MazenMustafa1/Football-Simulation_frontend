'use client';

import { useSidebarContext } from './Sidebar';

interface SidebarSectionProps {
  title: string;
  color?: string;
}

export function SidebarSection({
  title,
  color = 'text-gray-400',
}: SidebarSectionProps) {
  const { expanded, isHovered } = useSidebarContext();

  // Only show section headers when sidebar is expanded or hovered
  const showContent = expanded || isHovered;

  if (!showContent) {
    return null;
  }

  return (
    <div
      className={`mt-4 mb-2 px-4 text-xs font-semibold ${color} tracking-wider uppercase transition-all duration-300`}
    >
      {title}
    </div>
  );
}
