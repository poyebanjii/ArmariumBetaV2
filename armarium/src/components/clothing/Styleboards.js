import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig'; 
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import '../styles/StyleboardsFormat.css'; 

function Styleboards() {
  const [styleboards, setStyleboards] = useState([]);
  const auth = getAuth(); 
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [isDelete, setIsDelete] = useState(false);
  const [styleboardToDelete, setStyleboardToDelete] = useState([]);
  const [title, setTitle] = useState('');
  const navigate = useNavigate();
  const DELAY = 750;

  const fetchStyleboards = async (user) => {
    if (user) {
      const userId = user.uid;  
      const q = query(collection(db, 'Users', userId, 'Styleboards'));
      
      const querySnapshot = await getDocs(q);
      const styleboardsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStyleboards(styleboardsList);
      setTitle(querySnapshot.styleboardName);
      console.log(styleboardsList)
    } else {
      console.log("No user logged in");
    }
  };

  const filteredStyleboards = () => {
    if (!styleboards) return []; 
    return styleboards.filter(styleboard => {
      const matchesTitle = styleboard.styleboardName && styleboard.styleboardName.toLowerCase().includes(searchInput.toLowerCase());
      return matchesTitle;
    });
};


const handleSearchChange = (e) => {
  const inputValue = e.target.value.toLowerCase();
  setSearchInput(inputValue);
}

const handleDelete = async () => {
  const user = auth.currentUser;
  if (!styleboardToDelete.length) {
    alert("No styleboard has been selected.");
    return;
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, DELAY));

    for (const styleboard of styleboardToDelete) {
      const styleboardDocRef = doc(db, `Users/${user.uid}/Styleboards`, styleboard.id);
      await deleteDoc(styleboardDocRef);
      console.log("Styleboard deleted successfully:", styleboard.id);
    }

    setStyleboardToDelete([]);  
    setIsDelete(false);    
    await fetchStyleboards(user); 
  } catch (error) {
    console.error("Error deleting styleboard:", error);
    alert("Failed to delete styleboard. Please try again.");
  }
};

const addToDeleteList = (styleboards) => {
  setStyleboardToDelete(prevList => {
      if (prevList.some(item => item.id === styleboards.id)) {
          return prevList.filter(item => item.id !== styleboards.id);
      } else {
          return [...prevList, styleboards];
      }
  });
}

const toggleDelete = () => {
  if (isDelete) {
    setStyleboardToDelete([]);
  }
  setIsDelete(!isDelete);
};


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          fetchStyleboards(user).then(() => setLoading(false));
        } else {
            navigate('/login'); 
        }
    });

    return () => unsubscribe();
}, []);

return (
  <div>
    <Navbar /> 
    <h1>My Styleboards</h1>

    <input
      type="text"
      placeholder="Search styleboard by title"
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

    <ul className="styleboards-list">
      {filteredStyleboards().length > 0 ? (
        filteredStyleboards().map((styleboard) => (
          <li key={styleboard.id} className="styleboard-item">
            <div className="image-container">
              <h1>{styleboard.styleboardName}</h1>
              <img 
                src={styleboard.topImageUrl} 
                alt="Top"
                className="styleboard-image"
                onClick={() => isDelete ? addToDeleteList(styleboard) : navigate(`/editStyleboard/${styleboard.id}`)}
                style={{
                  border: styleboardToDelete.some(item => item.id === styleboard.id) ? '2px solid red' : 'none'
                }}
              />
              <img 
                src={styleboard.bottomImageUrl} 
                alt="Bottom" 
                className="styleboard-image"
                onClick={() => isDelete ? addToDeleteList(styleboard) : navigate(`/editStyleboard/${styleboard.id}`)}
                style={{
                  border: styleboardToDelete.some(item => item.id === styleboard.id) ? '2px solid red' : 'none'
                }}
              />
              <img 
                src={styleboard.shoesImageUrl} 
                alt="Shoes" 
                className="styleboard-image"
                onClick={() => isDelete ? addToDeleteList(styleboard) : navigate(`/editStyleboard/${styleboard.id}`)}
                style={{
                  border: styleboardToDelete.some(item => item.id === styleboard.id) ? '2px solid red' : 'none'
                }}
              />
            </div>
          </li>
        ))
      ) : (
        <p>No styleboards found.</p>
      )}
    </ul>
  </div>
);
}

export default Styleboards;
