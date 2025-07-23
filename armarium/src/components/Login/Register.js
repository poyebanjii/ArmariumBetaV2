import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig'; // Ensure your firebaseConfig exports db
//import '../styles/App.css';
import '../styles/Register.css';
import '../styles/Forms.css';

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
   * @param {*} e 
   */
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store additional user details in Firestore
      await setDoc(doc(db, 'Users', user.uid), {
        username,
        email,
        dateOfBirth,
        phoneNumber,
        accountSetup: false, // Initialize accountSetup as false
        isNewUser: true
      });

      console.log('User registered successfully');
      navigate('/userInfo'); // Redirect to the user information page after registration
    } catch (error) {
      console.error('Error registering user:', error);
      alert('Error registering user. Please try again.');
    }
  };

  return (
    <div className="Register-container">
      <div className="logo">
        <div className="logo-text">ARMARIUM</div>
      </div>
      <div className="Register-box">
        <form onSubmit={handleRegisterSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button className="Register-Button" type="submit">Register</button>
        </form>

        <div className="links">
          <Link to="/login">Already have an account?</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;