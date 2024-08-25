import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css';

function Ocassions() {
  const [selectedOcassions, setSelectedOcassions] = useState([]);
  const navigate = useNavigate();

  const ocassionsList = ['Formal', 'Party', 'Casual', 'Business'];

  const handleOcassionClick = (ocassion) => {
    setSelectedOcassions((prevOcassions) => 
      prevOcassions.includes(ocassion)
        ? prevOcassions.filter((o) => o !== ocassion)
        : [...prevOcassions, ocassion]
    );
  };

  const handleNext = () => {
    navigate('/register');
  };

  return (
    <div className="App">
      <h3>What occasions do you struggle with?</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
        {ocassionsList.map((ocassion) => (
          <button
            key={ocassion}
            onClick={() => handleOcassionClick(ocassion)}
            style={{
              backgroundColor: selectedOcassions.includes(ocassion) ? 'gray' : 'lightgray',
              padding: '10px 20px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {ocassion}
          </button>
        ))}
      </div>

      <button onClick={handleNext} style={{ display: 'block', margin: '20px auto' }}>
        Next
      </button>
    </div>
  );
}

export default Ocassions;
