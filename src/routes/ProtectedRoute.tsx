import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Define what settings this route guard expects to receive
interface ProtectedRouteProps {
  children: React.JSX.Element;
  allowedRoles: ('admin' | 'employee')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // 1. While Supabase is checking the browser cookies/tokens on refresh, show a brief loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-stone-500 font-medium text-sm animate-pulse">Verifying security token...</p>
        </div>
      </div>
    );
  }

  // 2. If the user is completely logged out, intercept the request and force them to sign in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If they are logged in but trying to visit an unauthorized page, bounce them back to the Home Hub
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }

  // 4. If they pass all security checks, load the requested page normally
  return children;
}