import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth'
import './styles/Navbar.css';

function ProfileDropdown() {
  const [userId, setUserId] = useState(null);
    //const navigate = useNavigate();

    useEffect(() => {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        setUserId(user.uid); // Set the user ID
      }
      console.log("user:", userId)
    }, []);
  
  
  
  return (
      <div className="dropdown-menu">
        <ul>
          <li>
          <Link to={`/profile`}>Profile</Link>
          </li>
          <li>
          <Link to={`/profileSettings`}>Settings</Link>
          </li>
          <li>
          <Link to={`/tutorials`}>Tutorials</Link>
          </li>
          <li>
          <Link to={`https://docs.google.com/forms/d/1vh_fvJm27AYNRzrLfdTZajZctn0Fr6Tdb4QUMaBo8NA/edit`}>Feedback</Link>
          </li>
      </ul>
      </div>
  );
  };
  
  export default ProfileDropdown;