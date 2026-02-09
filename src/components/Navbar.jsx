import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = [
    { to: '/', label: 'Tableau de bord' },
    { to: '/members', label: 'Membres' },
    { to: '/attendance', label: 'Présences' },
  ];

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-primary-500 shrink-0">
            🎵 Worship Team
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-300 hover:text-white transition whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop User */}
          <div className="hidden md:flex items-center space-x-4">
            <NotificationBell />
            <span className="text-gray-400 text-sm truncate max-w-[150px]">
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition whitespace-nowrap"
            >
              Déconnexion
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white transition"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMenu}
                  className="text-gray-300 hover:text-white transition px-2 py-2 rounded hover:bg-gray-700"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-gray-700 space-y-3">
                <div className="px-2 flex items-center justify-between">
                  <span className="text-gray-400 text-sm">{user?.name}</span>
                  <NotificationBell />
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
