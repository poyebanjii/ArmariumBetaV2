import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, deleteDoc, setDoc, addDoc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../backend/firebaseConfig";
import { db } from '../backend/firebaseConfig'; 
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../Navbar';
import OutfitsList from './OutfitsList';
import Loader from '../Loader';
import '../styles/MyOutfits.css';

function Outfits() {
  const [outfits, setOutfits] = useState([]);
  const auth = getAuth(); 
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [selectedOutfits, setSelectedOutfits] = useState([]);
  const [showStyleboardModal, setShowStyleboardModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [styleboardName, setStyleboardName] = useState('');
  const navigate = useNavigate();
  const DELAY = 750;
  const location = useLocation();
  const mode = location.state?.mode;
  const styleboard = location.state?.styleboard;
  const [existingOutfitIds, setExistingOutfitIds] = useState([]);

  const fetchOutfits = async (user) => {
    if (user) {
      setLoading(true);
      const userId = user.uid;  
      const q = query(collection(db, 'Users', userId, 'Outfits'));
      
      const querySnapshot = await getDocs(q);
      const outfitsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOutfits(outfitsList);
      console.log(outfitsList)
      setLoading(false);
    } else {
      console.log("No user logged in");
    }
  };

  const filteredOutfits = () => {
    if (!outfits) return [];
    let fOutfits = outfits.filter(outfit => {
      const matchesTitle = outfit.outfitName && outfit.outfitName.toLowerCase().includes(searchInput.toLowerCase());
      return matchesTitle;
    });
    return fOutfits;
};


const handleSearchChange = (e) => {
  const inputValue = e.target.value.toLowerCase();
  setSearchInput(inputValue);
}

const createStyleboard = async () => {
  const user = auth.currentUser;
  if (!selectedOutfits.length) {
    alert("No outfit has been selected.");
    return;
  }
  if (!styleboardName) return;

  try {
    await new Promise((resolve) => setTimeout(resolve, DELAY));

    const outfitRefs = selectedOutfits.map((outfit) =>
      doc(db, `Users/${user.uid}/Outfits`, outfit.id)
    );

    await addDoc(collection(db, `Users/${user.uid}/Styleboards`), {
      name: styleboardName,
      createdAt: new Date(),
      outfits: outfitRefs,
    });

    console.log("Styleboard created successfully:", styleboardName);
    setSelectedOutfits([]);
    setShowStyleboardModal(false);
  } catch (error) {
    console.error("Error creating styleboard:", error);
    alert("Failed to create styleboard. Please try again.");
  }
};

const handleAddToStyleboard = async () => {
  const user = auth.currentUser;
  if (!user || !styleboard) return;

  const outfitRefs = selectedOutfits.map((outfit) => doc(db, `Users/${user.uid}/Outfits`, outfit.id));
  const styleboardRef = doc(db, `Users/${user.uid}/Styleboards`, styleboard.id);

  // Update the user's private styleboard
  await updateDoc(styleboardRef, {
    outfits: arrayUnion(...outfitRefs),
  });

  // Only update ExploreStyleboards if it already exists (i.e., has been shared)
  const exploreRef = doc(db, 'ExploreStyleboards', styleboard.id);
  const exploreSnap = await getDoc(exploreRef);
  if (exploreSnap.exists()) {
    const currentExploreData = exploreSnap.data();
    const existingIds = new Set((currentExploreData.outfits || []).map(o => o.id));
    const newUniqueOutfits = selectedOutfits.filter(o => !existingIds.has(o.id));

    await updateDoc(exploreRef, {
      outfits: [...(currentExploreData.outfits || []), ...newUniqueOutfits],
    });
  }

  alert("Outfits added to styleboard!");
  navigate(-1);
};

const handleDelete = async () => {
  const user = auth.currentUser;
  if (!selectedOutfits.length) {
    alert("No outfit has been selected.");
    return;
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, DELAY));

    for (const outfit of selectedOutfits) {
      const outfitDocRef = doc(db, `Users/${user.uid}/Outfits`, outfit.id);
      await deleteDoc(outfitDocRef);
      console.log("Outfit deleted successfully:", outfit.id);
    }

    setSelectedOutfits([]);
    await fetchOutfits(user); 
    setShowDeleteModal(false);
  } catch (error) {
    console.error("Error deleting outfit:", error);
    alert("Failed to delete outfit. Please try again.");

  }
};

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      await fetchOutfits(user);

      // If we're in addToStyleboard mode, extract outfit IDs already in the styleboard
      if (mode === 'addToStyleboard' && styleboard?.outfits) {
        const outfitIds = [];
        for (const ref of styleboard.outfits) {
          // Handles both DocumentReference and plain outfit objects
          const id = ref?.id || ref;
          if (id) outfitIds.push(id);
        }
        setExistingOutfitIds(outfitIds);
      }

      setLoading(false);
    } else {
      navigate('/login');
    }
  });

  return () => unsubscribe();
}, []);

return (
  <div>
    <Loader loading={loading} />

    <Navbar />
    <div className="center">
      <h1 className="outfit-page-title">My Outfits</h1>
    </div>

    <div className="center">
      <input
        type="text"
        placeholder="Search outfits by title"
        value={searchInput}
        onChange={handleSearchChange} 
        className="search-input"
      />
    </div>

    <div className="center">
      {mode !== 'addToStyleboard' && (
        <>
          <button className="outfit-button" onClick={() => {
            if (selectedOutfits.length > 0) {
              setShowDeleteModal(true);
            } else {
              alert("No outfit has been selected.");
            }
          }}>
            Delete
          </button>
          <button className="outfit-button" onClick={() => {
            if (selectedOutfits.length > 0) {
              setShowStyleboardModal(true);
            } else {
              alert("No outfit has been selected.");
            }
          }}>
            Create Styleboard
          </button>
        </>
      )}
      {mode === 'addToStyleboard' && (
        <button className="outfit-button" onClick={handleAddToStyleboard} style={{ marginLeft: '10px' }}>
          Confirm Add to Styleboard
        </button>
    )}
    </div>
    
    <div className="center">
      <div className="outfit-outer">

      <OutfitsList 
        outfits={filteredOutfits()} 
        selectedOutfits={selectedOutfits} 
        setSelectedOutfits={setSelectedOutfits}
        existingOutfitIds={existingOutfitIds}
      />

      {/* Delete Modal */}
      <div className={`modal ${showDeleteModal ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Delete Outfits</h5>
              <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <p>Are you sure you want to delete the selected outfits?</p>
              <p>This action cannot be undone.</p>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={handleDelete}>
                Delete
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Styleboard Modal */}
      <div className={`modal ${showStyleboardModal ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Create Styleboard</h5>
              <button type="button" className="btn-close" onClick={() => setShowStyleboardModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <p>Enter a name for your styleboard:</p>
              <input
                type="text"
                className="form-control"
                placeholder="Styleboard name"
                value={styleboardName}
                onChange={(e) => setStyleboardName(e.target.value)}
              />
            </div>

            <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={createStyleboard}>
                  Save Styleboard
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowStyleboardModal(false)}>
                  Cancel
                </button>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}

export default Outfits;