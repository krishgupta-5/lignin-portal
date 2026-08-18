import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/predict', label: 'Predict' },
    { to: '/history', label: 'History' },
    { to: '/compare', label: 'Compare' },
    { to: '/reports', label: 'Reports' },
    { to: '/about', label: 'About' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="navbar-brand-icon">🌿</span>
          AI-Powered Lignin Extraction Predictor
        </Link>

        <div className="navbar-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="navbar-actions">
          {isAuthenticated && user ? (
            <div className="navbar-user-profile">
              <Link to="/profile" className="navbar-user-badge" title="View Profile">
                <div className="navbar-avatar">
                  {getInitials(user.name)}
                </div>
                <span className="navbar-user-name">
                  {user.name}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="navbar-logout-btn"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={16} />
                <span className="logout-text">Sign Out</span>
              </button>
            </div>
          ) : (
            <Link to="/login" className="navbar-signin-btn">
              <User size={16} />
              <span>Sign In</span>
            </Link>
          )}

          <button
            className="navbar-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <div className={`navbar-mobile-menu${mobileOpen ? ' open' : ''}`}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}

        <div className="navbar-mobile-auth">
          {isAuthenticated && user ? (
            <div className="navbar-mobile-user">
              <Link
                to="/profile"
                className="navbar-mobile-user-info"
                onClick={() => setMobileOpen(false)}
              >
                <div className="navbar-avatar">{getInitials(user.name)}</div>
                <div>
                  <div className="mobile-user-name">{user.name}</div>
                  <div className="mobile-user-email">{user.email}</div>
                </div>
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="navbar-mobile-logout"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          ) : (

            <Link
              to="/login"
              className="navbar-mobile-signin"
              onClick={() => setMobileOpen(false)}
            >
              <User size={16} /> Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
