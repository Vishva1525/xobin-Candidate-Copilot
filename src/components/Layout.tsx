import { ReactNode, useState } from 'react';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <MobileSidebar open={mobileOpen} setOpen={setMobileOpen} />
      <main className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur-sm px-4 py-3 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg text-foreground hover:bg-muted transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-foreground">xobin CoPilot</span>
        </div>
        {children}
      </main>
    </div>
  );
}

// Inline mobile sidebar wrapper that receives open state from Layout
import { AnimatePresence, motion } from 'framer-motion';
import { X, LayoutDashboard, FileText, Brain, LogOut, Sun, Moon, Rocket, ChevronDown, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import xobinLogo from '@/assets/xobin-logo.png';
import { useEffect } from 'react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/resume-lab', label: 'Resume Lab', icon: FileText },
  { to: '/prep-studio', label: 'Prep Studio', icon: Brain },
];

const roadmapItems = [
  { to: '/roadmap/prep-studio', label: 'Prep Studio Roadmap' },
  { to: '/roadmap/resume-lab', label: 'Resume Lab Roadmap' },
  { to: '/roadmap/dashboard', label: 'Dashboard Roadmap' },
];

function RoadmapNavGroup({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const isRoadmapActive = location.pathname.startsWith('/roadmap');
  const [expanded, setExpanded] = useState(isRoadmapActive);

  return (
    <div className="mt-2 pt-2 border-t border-sidebar-border/50">
      <button
        onClick={() => setExpanded(v => !v)}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
          isRoadmapActive
            ? 'text-sidebar-accent-foreground'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
        )}
      >
        <Rocket className={cn('h-4 w-4', isRoadmapActive && 'text-primary')} />
        <span className="flex-1 text-left">Coming Soon</span>
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-medium text-muted-foreground">Roadmap</Badge>
        {expanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
      {expanded && (
        <div className="ml-4 pl-3 border-l border-sidebar-border/50 mt-1 space-y-0.5">
          {roadmapItems.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={cn(
                  'block rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150',
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MobileSidebar({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const location = useLocation();
  const { email, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-sidebar-border bg-sidebar shrink-0">
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-sidebar-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden">
            <img src={xobinLogo} alt="xobin" className="h-8 w-8 object-contain" />
          </div>
          <div>
            <span className="text-base font-semibold text-foreground tracking-tight">xobin</span>
            <p className="text-[10px] text-muted-foreground leading-none">Candidate Portal</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(item => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to} className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active ? 'bg-sidebar-accent text-sidebar-accent-foreground glow-primary-sm' : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )}>
                <item.icon className={cn('h-4 w-4', active && 'text-primary')} />
                {item.label}
              </Link>
            );
          })}
          <RoadmapNavGroup />
        </nav>
        <div className="border-t border-sidebar-border px-4 py-4 space-y-3">
          <button onClick={toggleTheme} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
            <span className="text-xs font-medium">{theme === 'dark' ? 'Dark' : 'Light'} Mode</span>
            <div className="relative flex h-7 w-12 items-center rounded-full bg-muted p-0.5">
              <motion.div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-sm" animate={{ x: theme === 'light' ? 20 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}>
                {theme === 'dark' ? <Moon className="h-3.5 w-3.5 text-primary-foreground" /> : <Sun className="h-3.5 w-3.5 text-primary-foreground" />}
              </motion.div>
            </div>
          </button>
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-accent-foreground">{email}</p>
              <p className="text-xs text-muted-foreground">Candidate</p>
            </div>
            <button onClick={logout} className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors" title="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', stiffness: 400, damping: 35 }} className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar shadow-xl md:hidden">
              <button onClick={() => setOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2.5 px-6 py-5 border-b border-sidebar-border">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden">
                  <img src={xobinLogo} alt="xobin" className="h-8 w-8 object-contain" />
                </div>
                <div>
                  <span className="text-base font-semibold text-foreground tracking-tight">xobin</span>
                  <p className="text-[10px] text-muted-foreground leading-none">Candidate Portal</p>
                </div>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {navItems.map(item => {
                  const active = location.pathname.startsWith(item.to);
                  return (
                    <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                      active ? 'bg-sidebar-accent text-sidebar-accent-foreground glow-primary-sm' : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                    )}>
                      <item.icon className={cn('h-4 w-4', active && 'text-primary')} />
                      {item.label}
                    </Link>
                  );
                })}
                <RoadmapNavGroup onNavigate={() => setOpen(false)} />
              </nav>
              <div className="border-t border-sidebar-border px-4 py-4 space-y-3">
                <button onClick={toggleTheme} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
                  <span className="text-xs font-medium">{theme === 'dark' ? 'Dark' : 'Light'} Mode</span>
                  <div className="relative flex h-7 w-12 items-center rounded-full bg-muted p-0.5">
                    <motion.div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-sm" animate={{ x: theme === 'light' ? 20 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}>
                      {theme === 'dark' ? <Moon className="h-3.5 w-3.5 text-primary-foreground" /> : <Sun className="h-3.5 w-3.5 text-primary-foreground" />}
                    </motion.div>
                  </div>
                </button>
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-sidebar-accent-foreground">{email}</p>
                    <p className="text-xs text-muted-foreground">Candidate</p>
                  </div>
                  <button onClick={logout} className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors" title="Sign out">
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
