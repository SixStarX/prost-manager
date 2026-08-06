import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Splash from './Splash';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  // Enquanto o /auth/me resolve, evita piscar a tela de login.
  if (loading) return <Splash />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
