import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css';

function Ocassions() {
  const [selectedOcassions, setSelectedOcassions] = useState([]);
  const [customOcassion, setCustomOcassion] = useState('');
  const navigate = useNavigate();

  const ocassionsList = ['Formal', 'Party', 'Casual', 'Business'];

  const handleOcassionClick = (ocassion) => {
    setSelectedOcassions((prevOcassions) => 
      prevOcassions.includes(ocassion)
        ? prevOcassions.filter((o) => o !== ocassion)
        : [...prevOcassions, ocassion]
    );
  };

  const handleCustomOcassionAdd = () => {
    if (customOcassion && !selectedOcassions.includes(customOcassion)) {
      setSelectedOcassions((prevOcassions) => [...prevOcassions, customOcassion]);
      setCustomOcassion('');
    }
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

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <input
          type="text"
          value={customOcassion}
          onChange={(e) => setCustomOcassion(e.target.value)}
          placeholder="Insert your favorite occasions"
          style={{ padding: '10px', width: '200px', marginRight: '10px' }}
        />
        <button onClick={handleCustomOcassionAdd} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Add
        </button>
      </div>

      <button onClick={handleNext} style={{ display: 'block', margin: '20px auto' }}>
        Next
      </button>
    </div>
  );
}

export default Ocassions;
