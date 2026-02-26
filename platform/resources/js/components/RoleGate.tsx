import { useAuth } from '@/hooks/useAuth';
import type { Role } from '@/types';

interface RoleGateProps {
  roles: Role[];
  children: React.ReactNode;
}

export function RoleGate({ roles, children }: RoleGateProps) {
  const { user } = useAuth();
  if (!user) return null;
  const hasRole = user.roles.some((r) => roles.includes(r));
  if (!hasRole) return null;
  return <>{children}</>;
}
