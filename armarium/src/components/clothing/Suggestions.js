import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import '../styles/App.css';
import { db } from '../backend/firebaseConfig'; // Ensure your firebaseConfig exports db

function Suggestions() {
  const [event, setEvent] = useState('');
  const [theme, setTheme] = useState('');
  const [color, setColor] = useState('');
  const navigate = useNavigate();

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      alert('Please log in to submit suggestions.');
      return;
    }

    try {
      await addDoc(collection(db, `Users/${user.uid}/suggestions`), {
        userId: user.uid,
        event,
        theme,
        color,
        timestamp: new Date()
      });
      console.log('Suggestion submitted successfully');
      alert('Suggestion submitted successfully!');
      navigate('/outfits');
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      alert('Error submitting suggestion. Please try again.');
    }
  };

  return (
    <div className="App">
      <h2>What to wear?</h2>
      <form onSubmit={handleConfirmSubmit}>
        <label>
          What is the event?
          <input
            type="text"
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          What is the theme?
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          What is the color?
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit" className="confirmButton">Submit</button>
      </form>
      <br />
    </div>
  );
}

export default Suggestions;
