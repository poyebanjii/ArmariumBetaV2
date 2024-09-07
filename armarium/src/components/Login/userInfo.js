import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig'; // Ensure your firebaseConfig exports db
import '../styles/App.css';

function UserInfo() {
    const [gender, setGender] = useState("-");
    const [skin, setSkin] = useState("-");
    const navigate = useNavigate();

    const skinTones = [
      { name: 'Warm', shades: ['#5C2E1F', '#FBC6A4', '#FDE0D5', '#87442B'] },
      { name: 'Neutral', shades: ['#F1D5BA', '#AE6345', '#D8A172', '#4E2C1A'] },
      { name: 'Cool', shades: ['#F6DBC3', '#C6A089', '#D29B71', '#2A1C16'] }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if ((gender === 'male' || gender === 'female') && skin) {
          const auth = getAuth();
          const user = auth.currentUser;
          
          if (!user) {
            alert('Please log in to submit information.');
            return;
          }
    
          try {
            // Add gender and skin information to Firestore
            await addDoc(collection(db, `Users/${user.uid}/userInfo`), {
              gender,
              skin,
              timestamp: new Date()
            });
    
            console.log('User info submitted successfully');
            alert('Information submitted successfully!');
            navigate('/heightAndWeight');
          } catch (error) {
            console.error('Error submitting user info:', error);
            alert('Error submitting information. Please try again.');
          }
        } else {
          alert('Please select a gender and skin type.');
        }
      };


      return (
        <div className="App">
          <h2>Gender</h2>
          <form onSubmit={handleSubmit}>
            <select onChange={(e) => setGender(e.target.value)} value={gender}>
              <option value="-">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            
            <h3>Select Your Skin Tone</h3>
            <div className="skin-tone-container">
              {skinTones.map((group, groupIndex) => (
                <div key={groupIndex} className="skin-tone-group">
                  <h4>{group.name}</h4>
                  <div className="skin-tone-options">
                    {group.shades.map((color, index) => (
                      <div
                        key={index}
                        className={`skin-tone ${skin === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSkin(color)}
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
    
            <button type="submit" className="btn btn-dark">Submit</button>
          </form>
        </div>
      );
}


export default UserInfo;
