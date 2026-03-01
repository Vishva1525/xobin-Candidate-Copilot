import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { RoleChip } from './RoleChip';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-end px-6 py-3 border-b border-border bg-background/80 backdrop-blur-sm">
          <RoleChip />
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
