import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig'; // Ensure your firebaseConfig exports db
import '../styles/App.css';
import { doc, updateDoc } from 'firebase/firestore';

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

  const handleNext = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert('Please log in to save your occasions.');
      return;
    }

    try {
      // Add selected occasions to Firestore
      await addDoc(collection(db, `Users/${user.uid}/occasions`), {
        occasions: selectedOcassions,
        timestamp: new Date(),
      });
      await updateDoc(doc(db, 'Users', user.uid), {
        accountSetup: true
      });


      console.log('Occasions saved successfully');
      navigate('/outfits');
    } catch (error) {
      console.error('Error saving occasions:', error);
      alert('Error saving your occasions. Please try again.');
    }
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