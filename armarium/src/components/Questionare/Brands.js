import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
//import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; // Import Firebase Auth
import '../styles/App.css';

function Brands() {
  const [heightIn, setHeightIn] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [weight, setWeight] = useState('');
  const navigate = useNavigate();

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
        <br />
        <button type="submit">Next</button>
      </form>
      <br />
    </div>
  );
}

export default Brands;
