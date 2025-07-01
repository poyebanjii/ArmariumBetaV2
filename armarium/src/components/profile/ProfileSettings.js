import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfileSettings.css';
import Navbar from '../Navbar';
import { getAuth, updateEmail, updatePassword, deleteUser, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { db } from '../backend/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function ProfileSettings() {
  const auth = getAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Fetch Firestore user profile
        const userDocRef = doc(db, 'Users', currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUsername(data.username || '');
          setEmail(currentUser.email || '');

        } else {
          console.warn('User profile not found in Firestore.');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      if (!user) return;

      // Update display name (Firebase requires profile update separately)
      if (username && username !== user.displayName) {
        await updateProfile(user, { displayName: username });
      }
      await setDoc(doc(db, 'Users', user.uid), {
        username,
      }, { merge: true });

      // Update email
      if (email && email !== user.email) {
        await updateEmail(user, email);
      }

      // Update password if provided and confirmed
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          return setError("Passwords do not match.");
        }
        await updatePassword(user, newPassword);
      }

      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setError("Update failed: " + err.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your account?")) return;

    try {
      await deleteUser(user);
      alert("Account deleted successfully.");
      navigate('/signup');
    } catch (err) {
      console.error(err);
      setError("Failed to delete account: " + err.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="profile-settings">
        <h2>Profile Settings</h2>
        <form onSubmit={handleUpdate} className="profile-form">
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="error-text">{error}</p>}
          {message && <p className="success-text">{message}</p>}

          <button type="submit" className="submit-btn">Save Changes</button>
        </form>

        <hr style={{ margin: '30px 0' }} />

        <div className="danger-zone">
          <h3>Danger Zone</h3>
          <button className="delete-btn" onClick={handleDeleteAccount}>
            Delete My Account
          </button>
        </div>
      </div>
    </>
  );
}

export default ProfileSettings;
