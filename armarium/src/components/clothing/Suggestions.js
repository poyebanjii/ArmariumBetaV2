import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/App.css';


function Suggestions() {
  const [event, setEvent] = useState('');
  const [theme, setTheme] = useState('');
  const [color, setColor] = useState('');
  const navigate = useNavigate();

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    navigate('/outfits');
  };

  return (
      <div className="App">
        <h2>What to wear?</h2>
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
          What is the theme?:
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            required
          />
        </label>
        <label>
          What is color?:
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            required
          />
        </label>
        <br />
        <button className="confirmButton" onClick={handleConfirmSubmit}>Submit</button>
        <br />
      </div>
  );
}


export default Suggestions;
