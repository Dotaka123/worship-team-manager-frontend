import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu, X, LogOut, Music4,
  LayoutDashboard, Users, CalendarCheck,
  BarChart3, Wallet, ChevronDown, Shield, Search, TrendingUp
} from 'lucide-react';
import { useState } from 'react';
import NotificationBell from './NotificationBell';

const navLinks = [
  { to: '/',            label: 'Dashboard',   icon: LayoutDashboard, exact: true },
  { to: '/members',     label: 'Membres',      icon: Users },
  { to: '/attendance',  label: 'Présences',    icon: CalendarCheck },
  { to: '/cotisations', label: 'Cotisations',  icon: Wallet },
  { to: '/statistics',  label: 'Statistiques', icon: BarChart3 },
];

const adminLinks = [
  { to: '/admin/permissions', label: 'Permissions', icon: Shield }
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (link) => {
    if (link.exact) return pathname === link.to;
    return pathname === link.to || pathname.startsWith(link.to);
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <nav className="bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-15 gap-2" style={{ height: '58px' }}>

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 mr-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Music4 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-neutral-100 tracking-tight text-[0.95rem] hidden sm:block">
              Worship Team
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1">
            {navLinks.map((link) => {
              const active = isActive(link);
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap ${
                    active
                      ? 'bg-indigo-500/15 text-indigo-300'
                      : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/70'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 ml-0.5" />
                  )}
                </Link>
              );
            })}
            
            {/* Liens Admin - visible seulement pour les admins */}
            {user?.role === 'admin' && (
              <>
                <div className="w-px h-6 bg-neutral-800 mx-1" />
                {adminLinks.map((link) => {
                  const active = isActive(link);
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap ${
                        active
                          ? 'bg-purple-500/15 text-purple-300'
                          : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/70'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {link.label}
                      {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 ml-0.5" />
                      )}
                    </Link>
                  );
                })}
              </>
            )}
          </div>

          {/* ── Droite : Notifications + User ── */}
          <div className="flex items-center gap-2 ml-auto">
            <NotificationBell />

            {/* User Dropdown */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800/40 border border-neutral-800">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                {initials}
              </div>
              <div className="text-sm">
                <div className="text-neutral-100 font-medium leading-none">{user?.name || 'User'}</div>
                <div className="text-neutral-400 text-xs capitalize mt-0.5">{user?.role || 'member'}</div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-1 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700/50 transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/70"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-neutral-800">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const active = isActive(link);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-indigo-500/15 text-indigo-300'
                        : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/70'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}

              {/* Admin Links Mobile */}
              {user?.role === 'admin' && (
                <>
                  <div className="h-px bg-neutral-800 my-2" />
                  {adminLinks.map((link) => {
                    const active = isActive(link);
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                          active
                            ? 'bg-purple-500/15 text-purple-300'
                            : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/70'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {link.label}
                      </Link>
                    );
                  })}
                </>
              )}

              <div className="h-px bg-neutral-800 my-2" />
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-all"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
