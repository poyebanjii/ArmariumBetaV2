import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig'; // Ensure your firebaseConfig exports db
import '../styles/App.css';

function Styles() {
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [customStyle, setCustomStyle] = useState('');
  const navigate = useNavigate();

  const stylesList = ['Classic', 'Grunge', 'Goth', 'Preppy', 'Athletic', 'Comfy'];

  const handleStyleClick = (style) => {
    setSelectedStyles((prevStyles) => 
      prevStyles.includes(style)
        ? prevStyles.filter((s) => s !== style)
        : [...prevStyles, style]
    );
  };

  const handleCustomStyleAdd = () => {
    if (customStyle && !selectedStyles.includes(customStyle)) {
      setSelectedStyles((prevStyles) => [...prevStyles, customStyle]);
      setCustomStyle(''); // Clear the input field after adding
    }
  };

  const handleNext = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert('Please log in to save your styles.');
      return;
    }

    try {
      // Save selected styles to Firestore
      await addDoc(collection(db, `Users/${user.uid}/styles`), {
        styles: selectedStyles,
        timestamp: new Date(),
      });

      console.log('Styles saved successfully');
      navigate('/occasions');
    } catch (error) {
      console.error('Error saving styles:', error);
      alert('Error saving your styles. Please try again.');
    }
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

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <input
          type="text"
          value={customStyle}
          onChange={(e) => setCustomStyle(e.target.value)}
          placeholder="Insert your favorite styles"
          style={{ padding: '10px', width: '200px', marginRight: '10px' }}
        />
        <button onClick={handleCustomStyleAdd} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Add
        </button>
      </div>

      <button onClick={handleNext} style={{ display: 'block', margin: '20px auto' }}>
        Next
      </button>
    </div>
  );
}

export default Styles;