import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
//import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; // Import Firebase Auth
import '../styles/App.css';

function HeightAndWeight() {
  const [heightIn, setHeightIn] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [weight, setWeight] = useState('');
  const navigate = useNavigate();

  const handleNext = () => {
    // Proceed to the next page or handle the submission of selected brands
    navigate('/brands');
  };

  return (
    <div className="App">
      <form>
        <label>
          Height:
          <input
            type="number"
            value={heightIn}
            onChange={(e) => setHeightIn(e.target.value)}
            required
          />
          ft.
        </label>
        <br />
        <label>
          Height:
          <input
            type="number"
            value={heightFt}
            onChange={(e) => setHeightFt(e.target.value)}
            required
          />
          in.
        </label>
        <label>
          Weight:
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
        </label>
        <br />
        <button onClick = {handleNext} type="submit">Next</button>
      </form>
      <br />
    </div>
  );
}

export default HeightAndWeight;
