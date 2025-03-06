import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig'; 
import SplashScreen from './SplashScreen';
import '../styles/App.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading time
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully');
      alert('Login successful!');

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
      alert('Error logging in. Please check your email and password.');
    }
  };

  return (
    <div className="App">
      {loading ? (
        <SplashScreen />
      ) : (
        <>
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
          <Link to="/register">Register</Link>
        </>
      )}
    </div>
  );
}

export default Login;