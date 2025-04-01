import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth'
import './styles/Navbar.css';

function Dropdown() {
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
          <Link to={`/wardrobe`}>My Clothes</Link>
          </li>
          <li>
          <Link to={`/wardrobeOutfits/${userId}`}>My Outfits</Link>
          </li>
        </ul>
      </div>
  );
  };
  
  export default Dropdown;