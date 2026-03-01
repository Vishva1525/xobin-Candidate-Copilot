import { useAuth } from '@/hooks/use-auth';
import { Shield, Briefcase, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

const roleConfig = {
  admin: { label: 'Admin', icon: Shield, className: 'bg-destructive/15 text-destructive border-destructive/20' },
  recruiter: { label: 'Recruiter', icon: Briefcase, className: 'bg-warning/15 text-warning border-warning/20' },
  student: { label: 'Student', icon: GraduationCap, className: 'bg-primary/15 text-primary border-primary/20' },
} as const;

export function RoleChip() {
  const { role } = useAuth();
  if (!role) return null;
  const config = roleConfig[role];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold', config.className)}>
      <config.icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
