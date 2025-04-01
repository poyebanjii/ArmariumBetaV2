import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion"; 
import '../styles/Styleboards.css';
import '../styles/Modal.css';
import Navbar from '../Navbar';
import { collection, getDoc, getDocs,addDoc,getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth, db, storage } from '../backend/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import Joyride from 'react-joyride';

/**
 * The swipeable component for tops and bottoms
 * @param {Image to display} image 
 * @param {Function to handle swipes} handleSwipe
 * @param {Boolean for locking} isLocked
 * @returns the swipeable image.
 */

/**
 * The tinder style page for having users swipe left or right depending if they like the clothing item 
 * recommendation or not.
 * @returns Tinder page.
 */
function Styleboard() {
  const DELAY = 650;
  const user = auth.currentUser;
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [styleboardName, setStyleboardName] = useState('');
  const [outfit, setOutfit] = useState([]);

  const fetchData = async (user) => {
    await new Promise(resolve => setTimeout(resolve, DELAY));
    if (outfit.length === 0) {
      const outfitCollection = await getDocs(collection(db, `Users/${user.uid}/Outfits`));
      const outfitData = outfitCollection.docs.map(doc => {
        const data = doc.data();
        console.log('Fetched document:', data); // Log each document
        return data.url ? { id: doc.id, ...data } : null;
      }).filter(item => item !== null);
      console.log('Valid outfits:', outfitData); // Log the final array
      setOutfit(outfitData);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            fetchData(user).then(() => setLoading(false));
        } else {
            navigate('/login'); // Ensure you have a login route
        }
    });

    return () => unsubscribe();
}, []);

const saveStyleboard = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    alert('Please log in to save your styleboard.');
    console.error('User is not logged in.');
    return;
  }

  if (selectedOutfits.length === 0) {
    alert('Please select at least one outfit.');
    return;
  }

  try {
    console.log('Saving styleboard...');
    const docRef = await addDoc(collection(db, `Users/${user.uid}/Styleboards`), {
      styleboardName,
      outfits: selectedOutfits, // Save selected outfits
      timestamp: new Date()
    });

    console.log('Styleboard saved successfully with ID:', docRef.id);
    alert('Styleboard saved successfully!');
    setShowModal(false);
    setStyleboardName('');
    setSelectedOutfits([]); // Clear selected outfits
  } catch (error) {
    console.error('Error saving styleboard:', error);
    alert('Error saving styleboard. Please try again.');
  }
};
const [selectedOutfits, setSelectedOutfits] = useState([]); // State for selected outfits

const toggleOutfitSelection = (outfitId) => {
  if (selectedOutfits.includes(outfitId)) {
    setSelectedOutfits(selectedOutfits.filter(id => id !== outfitId)); // Deselect outfit
  } else {
    setSelectedOutfits([...selectedOutfits, outfitId]); // Select outfit
  }
};

  return (
    <>
      <div>
        <Navbar />
      </div>
  

      {/* Modal for selecting outfits */}
      <div className={`modal ${showModal ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Select Outfits for Styleboard</h5>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-body">
              {outfit.length === 0 ? (
                <p>No outfits available. Please add outfits to your wardrobe.</p>
              ) : (
                <div className="outfit-list">
                  {outfit.map((item) => (
                    item && item.url ? (
                      <div key={item.id} className="outfit-item">
                        <img
                          src={item.url}
                          alt={item.name || 'Outfit'}
                          className={`outfit-image ${selectedOutfits.includes(item.id) ? 'selected' : ''}`}
                          onClick={() => toggleOutfitSelection(item.id)}
                        />
                        <p>{item.name || 'Unnamed Outfit'}</p>
                      </div>
                    ) : null
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={saveStyleboard}
                disabled={selectedOutfits.length === 0}
              >
                Save Styleboard
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Styleboard;