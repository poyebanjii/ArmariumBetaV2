import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css';

function Styles() {
  const [selectedStyles, setSelectedStyles] = useState([]);
  const navigate = useNavigate();

  const stylesList = ['Classic', 'Grunge', 'Goth', 'Preppy', 'Athletic', 'Comfy'];

  const handleStyleClick = (style) => {
    setSelectedStyles((prevStyles) => 
      prevStyles.includes(style)
        ? prevStyles.filter((s) => s !== style)
        : [...prevStyles, style]
    );
  };

  const handleNext = () => {
    navigate('/ocassions');
  };

  return (
    <div className="App">
      <h3>What styles do you like?</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
        {stylesList.map((style) => (
          <button
            key={style}
            onClick={() => handleStyleClick(style)}
            style={{
              backgroundColor: selectedStyles.includes(style) ? 'gray' : 'lightgray',
              padding: '10px 20px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {style}
          </button>
        ))}
      </div>

      <button onClick={handleNext} style={{ display: 'block', margin: '20px auto' }}>
        Next
      </button>
    </div>
  );
}

export default Styles;
