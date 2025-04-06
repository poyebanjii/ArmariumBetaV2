import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../styles/UserProfile.css';

const db = getFirestore();
const auth = getAuth();

export default function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [friends, setFriends] = useState([]);
  const [messages, setMessages] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }
  
      // Fetch main user profile data
      const userRef = doc(db, 'Users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserData(userSnap.data());
      }
  
      // Fetch measurements from subcollection
      const measurementsQuery = query(
        collection(db, 'Users', user.uid, 'measurements')
      );
      const measurementsSnap = await getDocs(measurementsQuery);
      
      if (!measurementsSnap.empty) {
        // Optionally sort by timestamp if needed
        const sortedMeasurements = measurementsSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis());
  
        const latest = sortedMeasurements[0];
        setUserData(prev => ({ ...prev, ...latest })); // Merge measurements into userData
      }
  
      // Fetch friends
      const friendsQuery = query(
        collection(db, 'Users'),
        where('friends', 'array-contains', user.uid)
      );
      const friendsSnap = await getDocs(friendsQuery);
      setFriends(friendsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  
      // Fetch messages
      const messagesQuery = query(
        collection(db, 'messages'),
        where('to', '==', user.uid)
      );
      const messagesSnap = await getDocs(messagesQuery);
      setMessages(messagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
  
    fetchProfileData();
  }, [navigate]);
  


  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Hi, {userData?.username || 'User'}.</h1>
        <span className="profile-star">★</span>
      </div>

      <h2 className="weekly-title">Your <span className="weekly-highlight">weekly</span> styles</h2>

      <div className="style-bubbles">
        {['Artsy', 'Classic', 'Vintage', 'Edgy', 'Comfortable'].map((style, idx) => (
          <div key={idx} className={`bubble bubble-${idx}`}>{style}</div>
        ))}
      </div>

      <div className="measurements-box">
        <div className="measurements-header">
          <h3>Your measurements</h3>
          <button>Edit</button>
        </div>
        <div className="measurements-grid">
          <p>Height: {userData?.height ? `${userData.height} in` : '#'}</p>
          <p>Weight: {userData?.weight ? `${userData.weight} lbs` : '#'}</p>
        </div>
      </div>

      <div className="profile-section">
        <h3>Friends</h3>
        <ul>
          {friends.length ? friends.map(f => (
            <li key={f.id}>{f.username} ({f.email})</li>
          )) : <li>No friends found.</li>}
        </ul>
      </div>

      <div className="profile-section">
        <h3>Messages</h3>
        <ul>
          {messages.length ? messages.map(m => (
            <li key={m.id}><strong>From:</strong> {m.from} - {m.content}</li>
          )) : <li>No messages found.</li>}
        </ul>
      </div>

      <div className="indicator-row">
        <div className="indicator" />
        <div className="indicator" />
        <div className="indicator" />
      </div>
    </div>
  );
}