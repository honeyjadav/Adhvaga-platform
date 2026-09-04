import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Compass, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/tours', label: 'Explore Tours' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const { info } = useToast();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    info('You have been signed out.');
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-semibold transition ${
      isActive ? 'text-lagoon-700' : 'text-lagoon-500 hover:text-lagoon-700'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200/70 bg-sand-50/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lagoon-600 text-white">
            <Compass size={18} strokeWidth={2.25} />
          </span>
          <span className="font-display text-xl font-semibold text-lagoon-900">Adhvaga</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass} end>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn-secondary !px-5 !py-2">
                Log In
              </Link>
              <Link to="/register" className="btn-primary !px-5 !py-2">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-1.5 text-sm font-semibold text-lagoon-500 hover:text-lagoon-700">
                  <LayoutDashboard size={16} /> Admin
                </Link>
              )}
              <Link to="/dashboard" className="flex items-center gap-1.5 text-sm font-semibold text-lagoon-500 hover:text-lagoon-700">
                <User size={16} /> {user?.name?.split(' ')[0] || 'Dashboard'}
              </Link>
              <button onClick={handleLogout} className="btn-secondary !px-5 !py-2">
                <LogOut size={16} /> Log Out
              </button>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-lagoon-700 md:hidden"
          onClick={() => setIsOpen((o) => !o)}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-sand-200 bg-white px-4 pb-5 pt-3 md:hidden">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass} onClick={() => setIsOpen(false)} end>
                {link.label}
              </NavLink>
            ))}
            {isAdmin && (
              <Link to="/admin" className="text-sm font-semibold text-lagoon-500" onClick={() => setIsOpen(false)}>
                Admin Dashboard
              </Link>
            )}
            {!isAuthenticated ? (
              <div className="flex gap-3 pt-2">
                <Link to="/login" className="btn-secondary flex-1 !px-4" onClick={() => setIsOpen(false)}>
                  Log In
                </Link>
                <Link to="/register" className="btn-primary flex-1 !px-4" onClick={() => setIsOpen(false)}>
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link to="/dashboard" className="btn-secondary flex-1 !px-4" onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="btn-primary flex-1 !px-4">
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
