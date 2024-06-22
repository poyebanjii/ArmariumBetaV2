import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/App.css';

// NOTE: This is currently just the setup for this page until
// the app becomes more fleshed out.

/**
 * The page where if the user clicks forgot password. 
 * @returns The page of the forgot password page.
 */
function ForgotPassword() {
  /**
   * The email to send the code too.
   */
  const [email, setEmail] = useState('');
  
  /**
   * Recovery code.
   */
  const [recoverCode, setRecoverCode] = useState('');

  /**
  * Used for navigating to other pages.
  */
  const navigate = useNavigate();

  /**
   * Handles how the confirm button functions.
   * @param {*} e 
   */
  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    navigate('/new-password');
  };

  return (
      <div className="App">
        <h2>Type in your email so you can receive your recovery code</h2>
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
          Recovery Code:
          <input
            type="password"
            value={recoverCode}
            onChange={(e) => setRecoverCode(e.target.value)}
            required
          />
        </label>
        <br />
        <button className="confirmButton" onClick={handleConfirmSubmit}>Confirm</button>
        <br />
        <p>Send Code</p>
      </div>
  );
}


export default ForgotPassword;
