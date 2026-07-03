import React from 'react';
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
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>🗺️ CivicFix</Link>
      <div style={styles.links}>
        {user ? (
          <>
            <Link to="/analytics" style={styles.link}>📊 Analytics</Link>
            <Link to="/report" style={styles.link}>+ Report Issue</Link>
            <span style={styles.username}>👤 {user.name}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '12px 24px',
    backgroundColor: '#2d6a4f', color: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  },
  brand: {
    color: 'white', textDecoration: 'none',
    fontSize: '22px', fontWeight: 'bold'
  },
  links: { display: 'flex', alignItems: 'center', gap: '20px' },
  link: { color: 'white', textDecoration: 'none', fontSize: '15px' },
  username: { fontSize: '14px', opacity: 0.9 },
  logoutBtn: {
    background: 'transparent', border: '1px solid white',
    color: 'white', padding: '6px 14px',
    borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
  }
};

export default Navbar;