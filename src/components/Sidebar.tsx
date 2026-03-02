import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Brain, LogOut, Sun, Moon, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import xobinLogo from '@/assets/xobin-logo.png';
import { useState, useEffect } from 'react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/resume-lab', label: 'Resume Lab', icon: FileText },
  { to: '/prep-studio', label: 'Prep Studio', icon: Brain },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { email, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden">
          <img src={xobinLogo} alt="xobin" className="h-8 w-8 object-contain" />
        </div>
        <div>
          <span className="text-base font-semibold text-foreground tracking-tight">xobin</span>
          <p className="text-[10px] text-muted-foreground leading-none">Candidate Copilot</p>
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
              onClick={onNavigate}
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
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger — rendered via Layout */}
      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar shadow-xl md:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Export a hook-like function to control mobile sidebar from Layout
export function useMobileSidebar() {
  const [open, setOpen] = useState(false);
  return { open, setOpen };
}
