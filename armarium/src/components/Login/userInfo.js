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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if ((gender === 'male' || gender === 'female') && (skin === 'skin1' || skin === 'skin2')) {
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
            <br />
            <form onSubmit={handleSubmit}>
                <select onChange={(e) => setGender(e.target.value)} value={gender}>
                    <option value="-">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
                <br />
                <select onChange={(e) => setSkin(e.target.value)} value={skin}>
                    <option value="-">Select Skin</option>
                    <option value="skin1">Skin 1</option>
                    <option value="skin2">Skin 2</option>
                </select>
                <br />
                <button type="submit" className="btn btn-dark">Submit</button>
            </form>
        </div>
    );
}


export default UserInfo;
