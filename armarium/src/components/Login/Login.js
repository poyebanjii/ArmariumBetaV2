import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/App.css';

/**
 * This will be the login page as of now. 
 * @returns The page of the login page.
 */
function Login() {
  /**
   * The email for logging in.
   */
  const [email, setEmail] = useState('');
  
  /**
   * The password for logging in.
   */
  const [password, setPassword] = useState('');

  /**
   * Used for navigating to other pages.
   */
  const navigate = useNavigate();

  /**
   * This is gives the functionally of the login basically
   * the button. 
   * @param {*}} e 
   */
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    navigate('/suggestions');
  };


  return (
      <div className="App">
        <h2>ARMARIUM</h2>
        <label>
          Email:
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit" onClick={handleLoginSubmit}>Login</button>
        <br />
        <Link to="/forgot-password">Forgot Password</Link>
        <br />
        <Link to="/register">Register</Link>
      </div>
  );
}

export default Login;
