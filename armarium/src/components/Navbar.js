import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import './styles/Navbar.css'; 

function Navbar() {

  /*const handleLogout = async (e) => {
    e.preventDefault();

    Cookies.remove('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('searchInput');

    navigate('/login');
  };

  const handleMouseEnter = () => {
    setDropdownVisible(true);
    console.log("Hover");
  };

  const handleMouseLeave = () => {
    setDropdownVisible(false);
    console.log("unhover");
  };*/

  return (
    <nav className="navbar">
      <div className="container-fluid">
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <NavLink className="nav-link" to="/homepage" end>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/suggestions" end>
                Outfit
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/itemUpload" end>
                Upload
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );

}

export default Navbar;