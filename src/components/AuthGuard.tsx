import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '@/lib/api';
import { useUser } from '@/contexts/UserContext';


interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { setUser } = useUser();

  useEffect(() => {
    const checkAuth = async () => {
      // Add a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setIsAuthenticated(false);
        setIsLoading(false);
      }, 5000); // 5 second timeout

      try {
        const response = await getCurrentUser();
        clearTimeout(timeoutId);
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        clearTimeout(timeoutId);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <div className="ml-2 text-sm text-muted-foreground">Checking authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login with the current location as the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard; 