import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Pendant le chargement, afficher un loader
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="text-neutral-400 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur, rediriger vers login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si utilisateur existe, afficher le contenu
  return children;
};

export default ProtectedRoute;
