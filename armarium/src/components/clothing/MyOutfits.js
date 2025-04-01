import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig'; 
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import '../styles/MyOutfits.css'; 

function Outfits() {
  const [outfits, setOutfits] = useState([]);
  const auth = getAuth(); 
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [isDelete, setIsDelete] = useState(false);
  const [outfitToDelete, setOutfitToDelete] = useState([]);
  const [styleboardState, setStyleboardState] = useState(false);
  const [selectedOutfits, setSelectedOutfits] = useState([]);
  const [title, setTitle] = useState('');
  const navigate = useNavigate();
  const DELAY = 750;

  const fetchOutfits = async (user) => {
    if (user) {
      const userId = user.uid;  
      const q = query(collection(db, 'Users', userId, 'Outfits'));
      
      const querySnapshot = await getDocs(q);
      const outfitsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOutfits(outfitsList);
      setTitle(querySnapshot.outfitName);
      console.log(outfitsList)
    } else {
      console.log("No user logged in");
    }
  };

  const filteredOutfits = () => {
    if (!outfits) return []; 
    return outfits.filter(outfit => {
      const matchesTitle = outfit.outfitName && outfit.outfitName.toLowerCase().includes(searchInput.toLowerCase());
      return matchesTitle;
    });
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
  const styleboardName = prompt("Enter a name for your styleboard:");
  if (!styleboardName) return;

  try {
    await new Promise((resolve) => setTimeout(resolve, DELAY));
    const styleboardRef = doc(collection(db, `Users/${user.uid}/Styleboards`));
    await setDoc(styleboardRef, {
      styleboardName,
      outfits: selectedOutfits.map((outfit) => ({
        id: outfit.id,
        topImageUrl: outfit.topImageUrl,
        bottomImageUrl: outfit.bottomImageUrl,
        shoesImageUrl: outfit.shoesImageUrl,
      })),
      timestamp: new Date(),
    });
    console.log("Styleboard created successfully:", styleboardName);
    setSelectedOutfits([]);
    setStyleboardState(false);
  } catch (error) {
    console.error("Error creating styleboard:", error);
    alert("Failed to create styleboard. Please try again.");
  }
 }

 const addToStyleboardList = (outfits) => {
  setSelectedOutfits(prevList => {
      if (prevList.some(item => item.id === outfits.id)) {
          return prevList.filter(item => item.id !== outfits.id);
      } else {
          return [...prevList, outfits];
      }
  });
}

const toggleStyleboard = () => {
  if (styleboardState) {
    setSelectedOutfits([]);
  }
  setStyleboardState(!styleboardState);
}

const handleDelete = async () => {
  const user = auth.currentUser;
  if (!outfitToDelete.length) {
    alert("No outfit has been selected.");
    return;
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, DELAY));

    for (const outfit of outfitToDelete) {
      const outfitDocRef = doc(db, `Users/${user.uid}/Outfits`, outfit.id);
      await deleteDoc(outfitDocRef);
      console.log("Outfit deleted successfully:", outfit.id);
    }

    setOutfitToDelete([]);  
    setIsDelete(false);    
    await fetchOutfits(user); 
  } catch (error) {
    console.error("Error deleting outfit:", error);
    alert("Failed to delete outfit. Please try again.");
  }
};

const addToDeleteList = (outfits) => {
  setOutfitToDelete(prevList => {
      if (prevList.some(item => item.id === outfits.id)) {
          return prevList.filter(item => item.id !== outfits.id);
      } else {
          return [...prevList, outfits];
      }
  });
}

const toggleDelete = () => {
  if (isDelete) {
    setOutfitToDelete([]);
  }
  setIsDelete(!isDelete);
};


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          fetchOutfits(user).then(() => setLoading(false));
        } else {
            navigate('/login'); 
        }
    });

    return () => unsubscribe();
}, []);

return (
  <div>
    <Navbar /> 
    <h1>My Outfits</h1>

    <input
      type="text"
      placeholder="Search outfits by title"
      value={searchInput}
      onChange={handleSearchChange} 
    />

    <button onClick={toggleDelete}>
      {isDelete ? 'Cancel' : 'Delete'}
    </button>
    {isDelete && (
      <button onClick={handleDelete} style={{ marginLeft: '10px' }}>
        Confirm Delete
      </button>
    )}
    <button onClick={toggleStyleboard}>
      {styleboardState ? 'Cancel' : 'Create Styleboard'}
    </button>
    {styleboardState && (
      <button onClick={createStyleboard} style={{ marginLeft: '20px' }}>
        Save Styleboard
      </button>
    )}

    <ul className="outfits-list">
      {filteredOutfits().length > 0 ? (
        filteredOutfits().map((outfit) => (
          <li key={outfit.id} className="outfit-item">
            <div className="image-container">
              <h1>{outfit.outfitName}</h1>
              <img 
                src={outfit.topImageUrl} 
                alt="Top"
                className="outfit-image"
                onClick={() => isDelete ? addToDeleteList(outfit) : navigate(`/editOutfit/${outfit.id}`)}
                style={{
                  border: outfitToDelete.some(item => item.id === outfit.id) ? '2px solid red' : 'none'
                }}
              />
              <img 
                src={outfit.bottomImageUrl} 
                alt="Bottom" 
                className="outfit-image"
                onClick={() => isDelete ? addToDeleteList(outfit) : navigate(`/editOutfit/${outfit.id}`)}
                style={{
                  border: outfitToDelete.some(item => item.id === outfit.id) ? '2px solid red' : 'none'
                }}
              />
              <img 
                src={outfit.shoesImageUrl} 
                alt="Shoes" 
                className="outfit-image"
                onClick={() => isDelete ? addToDeleteList(outfit) : navigate(`/editOutfit/${outfit.id}`)}
                style={{
                  border: outfitToDelete.some(item => item.id === outfit.id) ? '2px solid red' : 'none'
                }}
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