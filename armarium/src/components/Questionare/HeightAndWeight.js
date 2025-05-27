import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig'; // Ensure your firebaseConfig exports db
import '../styles/App.css';
import '../styles/Forms.css';

function HeightAndWeight() {
  const [heightIn, setHeightIn] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [weight, setWeight] = useState('');
  const [error, setError] = useState('');
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
    <div className="Form-container">
      <div className="logo">
        <div className="logo-text">Sizing</div>
      </div>
      <div className="Form-box">
        <h2>Input your sizing to understand body shape. This may be skipped.</h2>
        <div className="input-group">
          <form className = "Height-Weight-Form" onSubmit={handleNext}>
            <label>
              Height:
              <input
                type="number"
                value={heightFt}
                onChange={(e) => setHeightFt(e.target.value)}
              />
            </label>
            <label>
              Chest
              <input
                type="number"
                value={heightIn}
                onChange={(e) => setHeightIn(e.target.value)}
              />
            </label>
            <label>
              Waist
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </label>
            <label>
              Hips
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </label>
            <label>
              Inseam
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </label>
            <button type="submit" className='Form-Submit'>Next</button>
          </form>
          <br />
        </div>
      </div>
    </div>
  );
}

export default HeightAndWeight;