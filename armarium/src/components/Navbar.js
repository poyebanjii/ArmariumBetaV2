import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import './styles/Navbar.css'; 
import Dropdown from './Dropdown';
import { getAuth, signOut } from 'firebase/auth'; // Import Firebase Authentication
function Navbar() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const handleLogout = async (e) => {
    e.preventDefault();
    
  
    try {
      await signOut(auth);
      navigate('/login'); // Redirect to login page after successful sign-out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleMouseEnter = () => {
    setDropdownVisible(true);
    console.log("Hover");
  };

  const handleMouseLeave = () => {
    setDropdownVisible(false);
    console.log("unhover");
  };


  return (
    <nav className="navbar">
      <div className="container-fluid">
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <NavLink className="nav-link" to="/outfits" end>
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
            <li
              className="nav-item dropdown"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
                Wardrobe
              {isDropdownVisible && <Dropdown />}
            </li>
            <li className="nav-item">
              <button className="nav-link btn btn-link" onClick={handleLogout}>
                Sign Out
              </button>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
