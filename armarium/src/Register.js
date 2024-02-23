import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

/**
 * The Register page where users can create their accounts.
 * @returns The page of the register page.
 */
function Register() {
    /**
    * The username.
    */
   const [username, setUsername] = useState('');

    /**
    * The email.
    */
    const [email, setEmail] = useState('');

    /**
     * The date of birth.
     */
    const [dateOfBirth, setDateOfBirth] = useState('');

    /**
     * Phone number
     * NOTE: This field is optional when the user creates their account.
     */
    const [phoneNumber, setPhoneNumber] = useState('');

    /**
    * The password.
    */
    const [password, setPassword] = useState('');

    /**
     * This variable here is for confirming your password. 
     */
    const [confirmPassword, setConfirmPassword] = useState('');

  /**
   * Used for navigating to other pages.
   */
  const navigate = useNavigate();

  /**
   * This is gives the functionally of the register button
   * @param {*}} e 
   */
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

  };


  return (
    <div className="App">
      <h2>Armarium</h2>
      <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <br />
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
          Date of Birth:
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Phone Number optional:
          <input
            type="tel" id="phone" name="phone" pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
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
        <label>
          Confirm Password:
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit" onClick={handleRegisterSubmit}>Register</button>
      <br />
    </div>
  );
}

// TODO: Still have to format phone number & include the confirm password.
// This is mostly just the setup.

export default Register;
