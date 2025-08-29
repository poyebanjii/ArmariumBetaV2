import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../Navbar';
import Loader from '../Loader';
import '../styles/ExploreFormat.css'; 
import Joyride from 'react-joyride';

function Explore() {
  const [styleboards, setStyleboards] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [runTour, setRunTour] = useState(false);
  const [steps, setSteps] = useState([]);
  const location = useLocation();
  const [rating, setRating] = useState(0);
  const [avgRating, setAvgRating] = useState(null);
  const [ratingCount, setRatingCount] = useState(0);

  const finishTour = async () => {
    localStorage.setItem('wardrobeTutorialCompleted', 'true'); 
    setRunTour(false);
  };

  useEffect(() => {
    const fetchExploreStyleboards = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'ExploreStyleboards'));
        const styleboardsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStyleboards(styleboardsList);
        console.log('Styleboard', styleboards);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching explore styleboards:', error);
        setLoading(false);
      }
    };

    fetchExploreStyleboards();
  }, []);

  useEffect(() => {
    if (location.state?.startTutorial) {
      setSteps([
        {
          target: '.explore-container',
          content: 'If you want to find what others are wearing, ths inspo boards has you covered. You can find other styleboards here to check out.',
          placement: 'center',
          disableBeacon: true,
        },
        {
          target: '.search-input',
          content: 'Quickly find specific styleboards by searching for their names.',
        },
        {
          target: '.explore-container',
          content: 'You can also view styleboards by clicking on them and if you like them, you can add to your bookmarks.',
          placement: 'center',
          disableBeacon: true,
        }
      ]);
      setRunTour(true);
    }
  }, [location]);

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value.toLowerCase());
  };

  const handleStyleboardClick = (styleboard) => {
    navigate(`/explore/${styleboard.id}`, { state: { styleboard } });
  };

  return (
    <div>
      <Loader loading={loading} />
      <Navbar />
      
      <div className="explore-container">
        <div className="explore-header">
          <h1>Explore InspoBoards</h1>
          <div className="search-container">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search styleboard by title"
              value={searchInput}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
        </div>

      <div className="pinterest-grid">
        {styleboards.length > 0 ? (
          styleboards
            .filter((styleboard) =>
              (styleboard.styleboardName || '').toLowerCase().includes(searchInput)
            )
            .map((styleboard) => {
              const firstOutfit = styleboard.outfits?.[0];

              return (
                <div
                  key={styleboard.id}
                  className="pin-card"
                  onClick={() => handleStyleboardClick(styleboard)}
                >
                  {firstOutfit && (
                    <div className="pin-image-container">
                      {firstOutfit.topImageUrl && (
                        <img src={firstOutfit.topImageUrl} alt="Top" loading="lazy" />
                      )}
                      {firstOutfit.bottomImageUrl && (
                        <img src={firstOutfit.bottomImageUrl} alt="Bottom" loading="lazy" />
                      )}
                      {firstOutfit.shoesImageUrl && (
                        <img src={firstOutfit.shoesImageUrl} alt="Shoes" loading="lazy" />
                      )}
                    </div>
                  )}
                  <h3>{styleboard.styleboardName || 'Unnamed Styleboard'}</h3>
                </div>
              );
            })
        ) : (
          <div className="no-results">
            <p>No styleboards found.</p>
          </div>
        )}
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
    </div>
  );
}

export default Explore;
