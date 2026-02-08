import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-primary-500">
            🎵 Worship Team
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-white transition"
            >
              Tableau de bord
            </Link>
            <Link 
              to="/members" 
              className="text-gray-300 hover:text-white transition"
            >
              Membres
            </Link>
            <Link 
              to="/attendance" 
              className="text-gray-300 hover:text-white transition"
            >
              Présences
            </Link>
          </div>

          {/* User */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
