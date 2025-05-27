import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig'; 
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { ref, listAll, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../backend/firebaseConfig";
import Navbar from '../Navbar';
import Loader from '../Loader';
import '../styles/StyleboardsFormat.css';
import '../styles/MyOutfits.css';

function Styleboards() {
  const [styleboards, setStyleboards] = useState([]);
  const auth = getAuth();
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStyleboards, setSelectedStyleboards] = useState([]);
  const navigate = useNavigate();
  const DELAY = 750;

  const fetchStyleboards = async (user) => {
    if (!user) return;

    try {
      setLoading(true);
      const q = query(collection(db, 'Users', user.uid, 'Styleboards'));
      const querySnapshot = await getDocs(q);

      const styleboardsList = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const styleboardData = docSnap.data();
          const outfits = await Promise.all(
            styleboardData.outfits.map(async (outfitRef) => {
              const outfitDoc = await getDoc(outfitRef);
              return outfitDoc.exists() ? { id: outfitDoc.id, ...outfitDoc.data() } : null;
            })
          );

          return {
            id: docSnap.id,
            ...styleboardData,
            outfits: outfits.filter(Boolean),
          };
        })
      );

      setStyleboards(styleboardsList);
    } catch (error) {
      console.error("Error fetching styleboards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxClick = (event, styleboardId) => {
    event.stopPropagation();
    setSelectedStyleboards((prevList) =>
      event.target.checked
        ? [...prevList, styleboardId]
        : prevList.filter((id) => id !== styleboardId)
    );
  };

  const handleDelete = async () => {
    const user = auth.currentUser;
    if (!selectedStyleboards.length) {
      alert("No styleboard selected.");
      return;
    }

    try {
      await new Promise((res) => setTimeout(res, DELAY));
      for (const styleboardId of selectedStyleboards) {
        const ref = doc(db, `Users/${user.uid}/Styleboards`, styleboardId);
        await deleteDoc(ref);
      }

      setSelectedStyleboards([]);
      await fetchStyleboards(user);
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Error deleting styleboard:", err);
      alert("Failed to delete styleboard. Please try again.");
    }
  };

  const handleStyleboardClick = (styleboard) => {
    navigate(`/styleboard/${styleboard.id}`, { state: { styleboard } });
  };

  const handleShareToExplore = async (styleboard) => {
    try {
      const exploreRef = doc(db, 'ExploreStyleboards', styleboard.id);
      await setDoc(exploreRef, {
        ...styleboard,
        styleboardName: styleboard.name, 
        sharedAt: new Date(),
      });
      alert('Styleboard shared to Explore!');
    } catch (error) {
      console.error('Error sharing styleboard:', error);
      alert('Failed to share styleboard.');
    }
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value.toLowerCase());
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchStyleboards(user);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, []);

  const filteredStyleboards = styleboards.filter((sb) =>
    sb.name?.toLowerCase().includes(searchInput)
  );

  return (
    <div>
      <Loader loading={loading} />
      <Navbar />
      <div className={loading ? 'blurred' : ''}>
        <h1>My Styleboards</h1>

        <input
          type="text"
          placeholder="Search styleboard by title"
          value={searchInput}
          onChange={handleSearchChange}
        />

        <div className="center">
          <button
            className="outfit-button"
            onClick={() =>
              selectedStyleboards.length > 0
                ? setShowDeleteModal(true)
                : alert("No styleboard selected.")
            }
          >
            Delete
          </button>
        </div>

        <div className="center">
          <div className="outfit-outer">
            {filteredStyleboards.length > 0 ? (
              <ul className="outfits-list">
                {filteredStyleboards.map((styleboard) => (
                  <li
                    key={styleboard.id}
                    className="outfit-item"
                    onClick={() => handleStyleboardClick(styleboard)}
                  >
                    <input
                      type="checkbox"
                      className="select-box"
                      onClick={(e) => handleCheckboxClick(e, styleboard.id)}
                      checked={selectedStyleboards.includes(styleboard.id)}
                    />
                    <div className="image-container">
                      {['topImageUrl', 'bottomImageUrl', 'shoesImageUrl'].map((key) => (
                        <img
                          key={key}
                          src={styleboard.outfits[0]?.[key]}
                          alt={key}
                          className="outfit-image center"
                        />
                      ))}
                    </div>
                    <div className="outfit-footer">
                      <h1 className="outfit-title">{styleboard.name}</h1>
                      <button
                        className="share-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareToExplore(styleboard);
                        }}
                      >
                        Share to Explore
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No styleboards found.</p>
            )}
          </div>
        </div>

        {/* Delete Modal */}
        <div className={`modal ${showDeleteModal ? 'd-block' : 'd-none'}`} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Styleboards</h5>
                <button className="btn-close" onClick={() => setShowDeleteModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete the selected styleboards?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleDelete}>Delete</button>
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Styleboards;
