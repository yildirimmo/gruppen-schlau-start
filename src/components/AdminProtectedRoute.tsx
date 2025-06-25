
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { isAdmin, isLoading: isCheckingAdmin } = useAdminCheck();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AdminProtectedRoute - User:', user?.id);
    console.log('AdminProtectedRoute - Loading:', loading);
    console.log('AdminProtectedRoute - Is Admin:', isAdmin);
    console.log('AdminProtectedRoute - Checking Admin:', isCheckingAdmin);

    if (!loading && !user) {
      console.log('No user found, redirecting to login');
      navigate("/login");
    } else if (!isCheckingAdmin && user && !isAdmin) {
      console.log('User is not admin, redirecting to dashboard');
      navigate("/dashboard");
    }
  }, [user, loading, isAdmin, isCheckingAdmin, navigate]);

  if (loading || isCheckingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Berechtigung wird überprüft...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    console.log('Access denied: user =', !!user, 'isAdmin =', isAdmin);
    return null;
  }

  console.log('Admin access granted');
  return <>{children}</>;
};

export default AdminProtectedRoute;
