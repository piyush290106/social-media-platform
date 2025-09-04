// Header component with navigation and user menu
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            Social Media
          </Link>

          {/* Navigation */}
          <nav className="nav">
            {isAuthenticated ? (
              // Authenticated user navigation
              <>
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/create-post" className="nav-link">Create Post</Link>
                <Link to="/profile" className="nav-link">Profile</Link>
                
                {/* User menu */}
                <div className="d-flex align-items-center gap-2">
                  <span className="nav-link">
                    Welcome, {user?.firstName || user?.username}!
                  </span>
                  <button 
                    onClick={logout} 
                    className="btn btn-secondary"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              // Guest navigation
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-link">Register</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;


