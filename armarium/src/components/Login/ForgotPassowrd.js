import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
//import '../styles/App.css';
import '../styles/Login.css';
import '../styles/ForgotPassword.css';

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

  const [message, setMessage] = useState('');

  /**
   * Handles how the confirm button functions.
   * @param {*} e 
   */
  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Recovery email sent!. Check your inbox");
      navigate('/login');
    }
    catch (error) {
      console.error(error);
    }
  };

  return (
      <div className="ForgotPassword-container">
        <div className="logo">
          <div className="logo-text">ARMARIUM</div>
        </div>
        <div className="ForgotPassword-box">
        <div className="input-group">
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
        <br />
        <button className="confirmButton" onClick={handleConfirmSubmit}>Confirm</button>
        <div className="links">
        <a href="/login">Already have an account?</a>
        <br />
        </div>
      </div>
      </div>
      </div>
  );
}


export default ForgotPassword;
