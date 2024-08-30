import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig'; // Ensure your firebaseConfig exports db
import '../styles/App.css';

function HeightAndWeight() {
  const [heightIn, setHeightIn] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [weight, setWeight] = useState('');
  const navigate = useNavigate();

  const handleNext = async (e) => {
    e.preventDefault();
    
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert('Please log in to save your height and weight.');
      return;
    }

    try {
      // Convert height to total inches for consistency
      const totalHeightInInches = parseInt(heightFt, 10) * 12 + parseInt(heightIn, 10);

      // Add height and weight to Firestore
      await addDoc(collection(db, `Users/${user.uid}/measurements`), {
        height: totalHeightInInches, // Store total height in inches
        weight: parseInt(weight, 10),
        timestamp: new Date(),
      });

      console.log('Height and weight saved successfully');
      navigate('/brands');
    } catch (error) {
      console.error('Error saving height and weight:', error);
      alert('Error saving your height and weight. Please try again.');
    }
  };

  return (
    <div className="App">
      <form onSubmit={handleNext}>
        <label>
          Height:
          <input
            type="number"
            value={heightFt}
            onChange={(e) => setHeightFt(e.target.value)}
            required
          />
          ft.
        </label>
        <br />
        <label>
          Height:
          <input
            type="number"
            value={heightIn}
            onChange={(e) => setHeightIn(e.target.value)}
            required
          />
          in.
        </label>
        <br />
        <label>
          Weight:
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
          lbs.
        </label>
        <br />
        <button type="submit">Next</button>
      </form>
      <br />
    </div>
  );
}

export default HeightAndWeight;