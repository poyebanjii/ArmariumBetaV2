import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../backend/firebaseConfig";
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
  const [showStyleboardModal, setShowStyleboardModal] = useState(false);
  const [styleboardName, setStyleboardName] = useState('');
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
  if (!styleboardName) return;

  try {
    await new Promise((resolve) => setTimeout(resolve, DELAY));

    for (const outfit of selectedOutfits) {
      // Define the original outfit path and the new styleboard path
      const originalOutfitPath = `Users/${user.uid}/Outfits/${outfit.id}/${outfit.outfitName}`;
      const styleboardPath = `Users/Styleboards/${user.uid}/${styleboardName}/${outfit.outfitName}`;

      console.log(`Reusing images from path: ${originalOutfitPath}`);
      console.log(`Creating styleboard path: ${styleboardPath}`);

      // Upload images to Firebase Storage
      const imageTypes = ["topImageUrl", "bottomImageUrl", "shoesImageUrl"];
      const uploadedImages = {};

      for (const type of imageTypes) {
        const imageUrl = outfit[type];
        const fileName = type.replace("ImageUrl", ""); // e.g., "topImageUrl" -> "top"
        const storageRef = ref(storage, `${styleboardPath}/${fileName}.jpg`);

        // Fetch the image as a blob
        const imageBlob = await fetch(imageUrl).then((res) => res.blob());

        // Upload the image to Firebase Storage
        await uploadBytes(storageRef, imageBlob);

        // Get the download URL for the uploaded image
        const downloadUrl = await getDownloadURL(storageRef);
        uploadedImages[fileName] = downloadUrl;

        console.log(`Uploaded ${fileName} image to: ${downloadUrl}`);
      }

      console.log(`Outfit "${outfit.outfitName}" added to styleboard at path: ${styleboardPath}`);
    }

    console.log("Styleboard created successfully:", styleboardName);
    setSelectedOutfits([]);
    setStyleboardState(false);
  } catch (error) {
    console.error("Error creating styleboard:", error);
    alert("Failed to create styleboard. Please try again.");
  }
};

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
    <div className="center">
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
    </div>
    
    <div className="center">
      <div className="outfit-outer">
        <ul className="outfits-list">
        <li className="add-outfit"
          onClick={() => navigate("/outfits")}></li>
        {filteredOutfits().length > 0 ? (
          filteredOutfits().map((outfit) => (
            <li key={outfit.id} className="outfit-item">
              <div className="image-container"
                onClick={() => isDelete ? addToDeleteList(outfit) : navigate(`/editOutfit/${outfit.id}`)}
                style={{
                  border: outfitToDelete.some(item => item.id === outfit.id) ? '2px solid red' : 'none'
                }}>
                {/* <h1>{outfit.outfitName}</h1> */}
                <img 
                  src={outfit.topImageUrl} 
                  alt="Top"
                  className="outfit-image center"
                />
                <img 
                  src={outfit.bottomImageUrl} 
                  alt="Bottom" 
                  className="outfit-image center"
                />
                <img 
                  src={outfit.shoesImageUrl} 
                  alt="Shoes" 
                  className="outfit-image center"
                />
              </div>
            </li>
          ))
        ) : (
          <p>No outfits found.</p>
        )}
      </ul>
      </div>
    </div>
  </div>
);
}

export default Outfits;