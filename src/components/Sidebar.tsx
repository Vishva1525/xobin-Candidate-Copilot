import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Brain, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/resume-lab', label: 'Resume Lab', icon: FileText },
  { to: '/prep-studio', label: 'Prep Studio', icon: Brain },
];

export function Sidebar() {
  const location = useLocation();
  const { email, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <span className="text-sm font-bold text-primary">X</span>
        </div>
        <div>
          <span className="text-base font-semibold text-foreground tracking-tight">xobin</span>
          <p className="text-[10px] text-muted-foreground leading-none">Candidate Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const active = location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground glow-primary-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className={cn('h-4 w-4', active && 'text-primary')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Theme toggle + User */}
      <div className="border-t border-sidebar-border px-4 py-4 space-y-3">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <span className="text-xs font-medium">{theme === 'dark' ? 'Dark' : 'Light'} Mode</span>
          <div className="relative flex h-7 w-12 items-center rounded-full bg-muted p-0.5 transition-colors">
            <motion.div
              className="flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-sm"
              animate={{ x: theme === 'light' ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {theme === 'dark' ? (
                <Moon className="h-3.5 w-3.5 text-primary-foreground" />
              ) : (
                <Sun className="h-3.5 w-3.5 text-primary-foreground" />
              )}
            </motion.div>
          </div>
        </button>

        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-accent-foreground">{email}</p>
            <p className="text-xs text-muted-foreground">Candidate</p>
          </div>
          <button
            onClick={logout}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
