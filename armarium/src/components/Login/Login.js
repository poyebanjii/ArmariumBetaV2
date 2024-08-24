import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; // Import Firebase Auth
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
   * @param {*} e 
   */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully');
      alert('Login successful!');
      navigate('/outfits'); // Redirect to the suggestions page upon successful login
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Error logging in. Please check your email and password.');
    }
  };

  return (
    <div className="App">
      <h2>ARMARIUM</h2>
      <form onSubmit={handleLoginSubmit}>
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
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Login</button>
      </form>
      <br />
      <Link to="/forgot-password">Forgot Password</Link>
      <br />
      <Link to="/userInfo">Register</Link>
    </div>
  );
}

export default Login;
