'use client';

import { ReactNode } from 'react';

interface RightPanelProps {
  children: ReactNode;
  title?: string;
}

export default function RightPanel({
  children,
  title = 'Updates',
}: RightPanelProps) {
  return (
    <aside className="h-screen">
      <nav className="flex h-full flex-col bg-white shadow-sm">
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center">
            <h1 className="px-3 text-xl font-bold">{title}</h1>
          </div>
        </div>

        <ul className="flex-1 space-y-1 px-3 py-5">{children}</ul>
      </nav>
    </aside>
  );
}
