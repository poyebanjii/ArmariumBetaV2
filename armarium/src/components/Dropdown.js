import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Dropdown() {
    //const navigate = useNavigate();
  
  
  return (
    <div className="dropdown-menu">
      <ul>
        <li>
        <Link to={`/wardrobe`}>My Clothes</Link>
        </li>
        <li>
        <Link to={`/settings`}>My Outfits</Link>
        </li>
      </ul>
    </div>
  );
  };
  
  export default Dropdown;