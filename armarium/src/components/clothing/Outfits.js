import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig';  // Adjust the import based on your folder structure
import { getAuth } from 'firebase/auth';
import Navbar from '../Navbar';

function Outfits() {
  const [outfits, setOutfits] = useState([]);
  const auth = getAuth(); // Get the current authenticated user

  useEffect(() => {
    const fetchOutfits = async () => {
      const user = auth.currentUser;  // Get current user
      
      if (user) {
        const userId = user.uid;  // Assuming you're storing user outfits using their UID
        const q = query(collection(db, 'Users', userId, 'Outfits'));
        
        const querySnapshot = await getDocs(q);
        const outfitsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOutfits(outfitsList);
      } else {
        console.log("No user logged in");
      }
    };

    fetchOutfits();
  }, [auth]);

  return (
    <div>
    <Navbar /> 
      <h1>My Outfits</h1>
      <ul className="outfits-list">
        {outfits.length > 0 ? (
          outfits.map((outfit) => (
            <li key={outfit.id} className="outfit-item">
              <div className="image-container">
                <img 
                  src={outfit.topImageUrl} 
                  alt="Top"
                  className="outfit-image"
                />
                <img 
                  src={outfit.bottomImageUrl} 
                  alt="Bottom" 
                  className="outfit-image"
                />
                <img 
                  src={outfit.shoesImageUrl} 
                  alt="Shoes" 
                  className="outfit-image"
                />
              </div>
            </li>
          ))
        ) : (
          <p>No outfits found.</p>
        )}
      </ul>
    </div>
  );
}

export default Outfits;
