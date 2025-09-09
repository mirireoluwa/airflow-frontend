import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAirflow } from '../../context/AirflowContext';
import { canAccessAnalytics, canAccessKanban } from '../../utils/roleUtils';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'analytics' | 'kanban' | 'admin';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { state } = useAirflow();

  if (!state.currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (requiredRole === 'analytics' && !canAccessAnalytics(state.currentUser)) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === 'kanban' && !canAccessKanban(state.currentUser)) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === 'admin' && state.currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
