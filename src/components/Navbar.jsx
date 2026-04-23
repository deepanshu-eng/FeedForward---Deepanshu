import React, { useState, useEffect, useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">FeedForward</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          <NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/donate" onClick={() => setMenuOpen(false)}>Donate Food</NavLink>
          <NavLink to="/find" onClick={() => setMenuOpen(false)}>Find Food</NavLink>
          <NavLink to="/about" onClick={() => setMenuOpen(false)}>About</NavLink>

          {user ? (
            <>
              <NavLink to={user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'} onClick={() => setMenuOpen(false)}>
                Dashboard
              </NavLink>
              <button onClick={logout} className="btn btn-outline" style={{ marginLeft: '12px' }}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Login</Link>
          )}
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`bar ${menuOpen ? 'bar-open' : ''}`}></span>
          <span className={`bar ${menuOpen ? 'bar-open' : ''}`}></span>
          <span className={`bar ${menuOpen ? 'bar-open' : ''}`}></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;