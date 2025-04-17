import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const history = useHistory();

  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  if (!currentUser) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">
          Polkadot Attendance NFT
        </Link>
      </div>
      <div className="navbar-menu">
        <Link to="/" className="navbar-item">Dashboard</Link>
        <Link to="/events" className="navbar-item">Events</Link>
      </div>
      <div className="navbar-end">
        <span className="navbar-item user-name">
          {currentUser.name || currentUser.email}
        </span>
        <button onClick={handleLogout} className="btn btn-text">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

