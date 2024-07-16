import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig'; // Ensure your firebaseConfig exports db

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
        phoneNumber
      });

      console.log('User registered successfully');
      alert('User registered successfully!');
      navigate('/'); // Redirect to home page or another page after registration
    } catch (error) {
      console.error('Error registering user:', error);
      alert('Error registering user. Please try again.');
    }
  };

  return (
    <div className="App">
      <h2>ARMARIUM</h2>
      <form onSubmit={handleRegisterSubmit}>
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
            type="email"
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
          Phone Number (optional):
          <input
            type="tel"
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
        <button type="submit">Register</button>
      </form>
      <br />
    </div>
  );
}

export default Register;