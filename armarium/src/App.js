import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Register from './Register';
import ForgotPassword from './ForgotPassowrd';
import NewPassword from './NewPassowrd';

/**
 * This will be the login page as of now. 
 * @returns The page of the login page.
 */
function App() {
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
  //const navigate = useNavigate();

  /**
   * This is gives the functionally of the login basically
   * the button. 
   * @param {*}} e 
   */
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    //navigate('/');
  };


  return (
      <div className="App">
        <h2>Armarium</h2>
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

/**
 * The routers function is there to give navigation/routing to other pages.
 * Currently setup like this for now as it works.
 * @returns The routing of the various pages.
 */
function Routers() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />}/>
        <Route path="/new-password" element={<NewPassword />}/>
      </Routes>
    </Router>
  );
}

export default Routers;
