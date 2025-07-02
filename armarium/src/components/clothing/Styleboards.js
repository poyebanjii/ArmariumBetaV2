import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, deleteDoc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig'; 
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { ref, listAll, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../backend/firebaseConfig";
import { useLocation } from 'react-router-dom';
import Navbar from '../Navbar';
import Loader from '../Loader';
import '../styles/StyleboardsFormat.css';
import '../styles/MyOutfits.css';
import Joyride from 'react-joyride';

function Styleboards() {
  const [styleboards, setStyleboards] = useState([]);
  const auth = getAuth();
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStyleboards, setSelectedStyleboards] = useState([]);
  const navigate = useNavigate();
  const DELAY = 750;
  const location = useLocation();
  const [runTour, setRunTour] = useState(false);
  const [steps, setSteps] = useState([]);

  const finishTour = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'Users', user.uid);
      await updateDoc(userDocRef, { isNewUser: false });
    }
    localStorage.setItem('wardrobeTutorialCompleted', 'true'); 
    setRunTour(false);
  };

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

          const exploreRef = doc(db, 'ExploreStyleboards', docSnap.id);
          const exploreSnap = await getDoc(exploreRef);
          const isShared = exploreSnap.exists();

          return {
            id: docSnap.id,
            ...styleboardData,
            outfits: outfits.filter(Boolean),
            isShared,
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
        // Delete from user's Styleboards
        const userStyleboardRef = doc(db, `Users/${user.uid}/Styleboards`, styleboardId);
        await deleteDoc(userStyleboardRef);

        // Also delete from ExploreStyleboards if it exists
        const exploreRef = doc(db, 'ExploreStyleboards', styleboardId);
        const exploreSnap = await getDoc(exploreRef);
        if (exploreSnap.exists()) {
          await deleteDoc(exploreRef);
          console.log(`Removed from Explore: ${styleboardId}`);
        }
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
      fetchStyleboards(auth.currentUser);
    } catch (error) {
      console.error('Error sharing styleboard:', error);
      alert('Failed to share styleboard.');
    }
  };

  const handleUnShareToExplore = async (styleboard) => {
    try {
      const exploreRef = doc(db, 'ExploreStyleboards', styleboard.id);
      await deleteDoc(exploreRef);
      fetchStyleboards(auth.currentUser);
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

  useEffect(() => {
    if (location.state?.startTutorial) {
      setSteps([
        {
          target: '.content-container',
          content: 'This here is where you can find your styleboards, a way to organize your outfits.',
          placement: 'center',
          disableBeacon: true,
        },
        {
          target: '.search-input',
          content: 'Quickly find specific styleboards by searching for their names.',
        },
        {
          target: '.delete-btn',
          content: 'You can select styleboards for them to be deleted with this button.',
        },
        {
          target: '.content-container',
          content: 'You can also share styleboards to the explore inspo board for others to see. You can also view your styleboards with the outfits and can edit them.',
          placement: 'center',
          disableBeacon: true,
        },
      ]);
      setRunTour(true);
    }
  }, [location]);

  return (
  <div className="app-container">
    <Navbar />
    <div className="content-container">
      <Loader loading={loading} />
      
      <div className={loading ? 'blurred' : ''}>
        <div className="styleboards-header-container">
          <div className="styleboards-header">
            <h1>My Styleboards</h1>
                <button
                  onClick={() =>
                    selectedStyleboards.length > 0
                      ? setShowDeleteModal(true)
                      : alert("No styleboard selected.")
                  }
                  className='delete-btn'
                >
                  Delete Selected
                </button>
            <div className="header-controls">
              <div className="search-container">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search styleboard by title"
                  value={searchInput}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
        </div>

        {filteredStyleboards.length > 0 ? (
          <div className="styleboards-grid">
            {filteredStyleboards.map((styleboard) => (
              <div
                key={styleboard.id}
                className="styleboard-card"
                onClick={() => handleStyleboardClick(styleboard)}
              >
                <input
                  type="checkbox"
                  className="card-checkbox"
                  onClick={(e) => handleCheckboxClick(e, styleboard.id)}
                  checked={selectedStyleboards.includes(styleboard.id)}
                />
                
                <div className="images-grid">
                  {styleboard.outfits.slice(0, 4).map((outfit, index) => (
                    <img
                      key={index}
                      src={outfit.topImageUrl || outfit.bottomImageUrl || outfit.shoesImageUrl}
                      alt={`Outfit ${index + 1}`}
                      className="grid-image"
                    />
                  ))}
                </div>
                
                <div className="card-footer">
                  <h3 className="card-title">{styleboard.name}</h3>
                  <button
                    className={`share-button ${styleboard.isShared ? 'shared' : 'unshared'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      styleboard.isShared 
                        ? handleUnShareToExplore(styleboard)
                        : handleShareToExplore(styleboard);
                    }}
                  >
                    {styleboard.isShared ? 'Unshare from Explore' : 'Share to Explore'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No styleboards found. Create your first styleboard to get started!</p>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Delete Styleboards</h3>
              <p>Are you sure you want to delete {selectedStyleboards.length} selected styleboard(s)? This action cannot be undone.</p>
              <div className="modal-actions">
                <button className="modal-button modal-cancel" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button className="modal-button modal-confirm" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    <Joyride
        steps={steps}
        run={runTour}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        callback={(data) => {
          if (data.status === 'finished' || data.status === 'skipped') {
            finishTour();
          }
        }}
      />
    </div>

  );
}

export default Styleboards;
