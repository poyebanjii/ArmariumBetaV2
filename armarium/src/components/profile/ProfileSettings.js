import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/ProfileSettings.css';

function ProfileSettings() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  
  const navigate = useNavigate();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    navigate('/suggestions');
  };

  return (
    <div className="profile-settings">
      <h2>Profile Settings</h2>
      <form onSubmit={handleLoginSubmit} className="profile-form">
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-btn">Save Changes</button>
      </form>
    </div>
  );
}

export default ProfileSettings;