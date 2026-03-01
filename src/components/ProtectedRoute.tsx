import { Navigate } from 'react-router-dom';
import { useAuth, type AppRole } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to their appropriate dashboard
    const dashboardMap: Record<AppRole, string> = {
      student: '/dashboard',
      recruiter: '/recruiter',
      admin: '/admin',
    };
    return <Navigate to={dashboardMap[role] || '/dashboard'} replace />;
  }

  return <>{children}</>;
}
