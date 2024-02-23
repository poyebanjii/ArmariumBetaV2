import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

// NOTE: This is currently just the setup for this page until
// the app becomes more fleshed out.

/**
 * The page where if the user can enter their new password. 
 * @returns The page of the new password page.
 */
function NewPassword() {
    /**
    * The new password.
    */
    const [password, setPassword] = useState('');

    /**
     * The confirmation of the new password. 
     */
    const [confirmPassword, setConfirmPassword] = useState('');

  /**
   * Used for navigating to other pages.
   */
  //const navigate = useNavigate();

  return (
      <div className="App">
        <label>
          New Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Confirm New Password:
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Confirm</button>
        <br />
      </div>
  );
}


export default NewPassword;
