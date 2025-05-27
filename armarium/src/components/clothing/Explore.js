import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import '../styles/ExploreFormat.css'; 

function Explore() {
  const [styleboards, setStyleboards] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExploreStyleboards = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'ExploreStyleboards'));
        const styleboardsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStyleboards(styleboardsList);
        console.log('Styleboard', styleboards);
      } catch (error) {
        console.error('Error fetching explore styleboards:', error);
      }
    };

    fetchExploreStyleboards();
  }, []);

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value.toLowerCase());
  };

  const handleStyleboardClick = (styleboard) => {
    navigate(`/explore/${styleboard.id}`, { state: { styleboard } });
  };

  return (
    <div>
      <Navbar />
      <div className="explore-container">
        <h1>Explore InspoBoards</h1>

        <input
          type="text"
          placeholder="Search styleboard by title"
          value={searchInput}
          onChange={handleSearchChange}
          className="search-input"
        />

        <ul className="styleboards-list">
          {styleboards.length > 0 ? (
            styleboards
              .filter((styleboard) =>
                (styleboard.styleboardName || '').toLowerCase().includes(searchInput)
              )
              .map((styleboard) => {
                const firstOutfit = styleboard.outfits?.[0];

                return (
                  <li
                    key={styleboard.id}
                    className="styleboard-item"
                    onClick={() => handleStyleboardClick(styleboard)}
                  >
                    <h2>{styleboard.styleboardName || 'Unnamed Styleboard'}</h2>

                    {firstOutfit && (
                      <div className="first-outfit-preview">
                        <div className="image-container">
                          {firstOutfit.topImageUrl && (
                            <img
                              src={firstOutfit.topImageUrl}
                              alt="Top"
                              className="outfit-image"
                            />
                          )}
                          {firstOutfit.bottomImageUrl && (
                            <img
                              src={firstOutfit.bottomImageUrl}
                              alt="Bottom"
                              className="outfit-image"
                            />
                          )}
                          {firstOutfit.shoesImageUrl && (
                            <img
                              src={firstOutfit.shoesImageUrl}
                              alt="Shoes"
                              className="outfit-image"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })
          ) : (
            <p>No styleboards found.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Explore;
