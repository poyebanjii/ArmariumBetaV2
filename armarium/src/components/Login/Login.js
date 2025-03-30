import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig'; 
import '../styles/App.css';
import '../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully');
      //alert('Login successful!');

      // Check the accountSetup status
      const user = auth.currentUser;
      const userDocRef = doc(db, `Users/${user.uid}`);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const { accountSetup } = userDoc.data();
        
        if (accountSetup === false) {
          navigate('/userInfo'); // Navigate to /userInfo if accountSetup is false
        } else {
          navigate('/outfits'); // Navigate to /outfits if accountSetup is true
        }
      } else {
        console.log('No user document found');
        alert('User data not found.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Invalid email or password. Please try again.'); // Display error message
    }
  };

  return (
    <div className="login-container">
      <div className="logo">
        <div className="logo-text">ARMARIUM</div>
      </div>
      <div className="login-box">
        <form onSubmit={handleLoginSubmit}>
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
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="error-message">{error}</p>}
          </div>
          <button type="submit" className="login-button">Sign in</button>
        </form>
        <div className="links">
          <Link to="/forgot-password">Forgot Password</Link>
          <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;