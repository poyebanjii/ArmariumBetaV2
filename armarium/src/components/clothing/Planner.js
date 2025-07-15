import React, { useState, useEffect } from 'react';
import { Calendar } from 'react-date-range';
import { isSameDay } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import Navbar from '../Navbar';
import Loader from '../Loader';
import { db } from '../backend/firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';
import Joyride from 'react-joyride';

function Planner() {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [outfits, setOutfits] = useState([]);
  const [selectedOutfitsByDate, setSelectedOutfitsByDate] = useState({});
  
  const [runTour, setRunTour] = useState(false);
  const [steps, setSteps] = useState([]);

  const location = useLocation();

  // Fetch user and outfits
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchOutfits(currentUser);
        await fetchPlanner(currentUser); 
      }
    });
    return () => unsubscribe();
  }, []);

    const finishTour = async () => {
      localStorage.setItem('wardrobeTutorialCompleted', 'true'); 
      setRunTour(false);
    };


  const fetchOutfits = async (currentUser) => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, `Users/${currentUser.uid}/Outfits`));
      const outfitList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOutfits(outfitList);
    } catch (err) {
      console.error("Error fetching outfits:", err);
    }
    setLoading(false);
  };

    const fetchPlanner = async (currentUser) => {
    try {
        const plannerRef = doc(db, `Users/${currentUser.uid}/DailyPlanner`, 'OutfitsByDate');
        const plannerSnap = await getDoc(plannerRef);
        if (plannerSnap.exists()) {
        const data = plannerSnap.data();
        if (data.outfits) {
            setSelectedOutfitsByDate(data.outfits);
        }
        }
    } catch (error) {
        console.error("Error fetching planner:", error);
    }
};

  const handleSelect = (ranges) => {
    const date = ranges.selection.startDate;
    setSelectedDate(date);
  };

  const handleAssignOutfit = (outfitId) => {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    setSelectedOutfitsByDate((prev) => ({
      ...prev,
      [formattedDate]: outfitId,
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, `Users/${user.uid}/DailyPlanner`, 'OutfitsByDate'), {
        outfits: selectedOutfitsByDate,
      });
      alert("Planner saved successfully!");
    } catch (err) {
      console.error("Error saving planner:", err);
      alert("Failed to save planner.");
    }
  };

    useEffect(() => {
      if (location.state?.startTutorial) {
        setSteps([
          {
            target: '.center',
            content: 'The planner is where you can plan out your outfits that you might wear for certain days.',
            placement: 'center',
            disableBeacon: true,
          },
          {
            target: '.outfit-planner',
            content: 'This calendar allows you to select a day for what outfit you want wear on that day.',
          },
          {
            target: '.outfit-assign',
            content: 'You can click this to choose which outfit you want to wear for that day.',
          },
          {
            target: '.outfit-button:nth-of-type(1)', // First button (Delete)
            content: 'Once you are all done planning out your outfits you can save the planner with this button.',
          },
        ]);
        setRunTour(true);
      }
  }, [location]);

  return (
    <div>
      <Navbar />
      <Loader loading={loading} />

      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }} className='center'>
        {/* Calendar Side */}
        <div style={{
          width: '350px',
          marginRight: '40px',
          background: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
        className='outfit-planner'>
          <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Outfit Planner</h2>
          <p style={{ textAlign: 'center', fontSize: '0.95rem', color: '#555' }}>
            Select a day to assign an outfit
          </p>

          <Calendar
            date={selectedDate}
            onChange={(date) => setSelectedDate(date)}
              dayContentRenderer={(date) => {
              const formatted = format(date, 'yyyy-MM-dd');
              const isPlanned = !!selectedOutfitsByDate[formatted];
              return (
                <div style={{
                  position: 'relative',
                  backgroundColor: isPlanned ? '#e6f0ff' : 'transparent',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span>{date.getDate()}</span>
                </div>
              );
            }}
          />
        </div>

        {/* Outfit Selection Side */}
        <div style={{
          width: '350px', // Match the calendar
          background: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
        className="assign-container">
          <h3 style={{ marginBottom: '15px' }}>
            Assign Outfit for: <span style={{ color: '#007bff' }}>{format(selectedDate, 'yyyy-MM-dd')}</span>
          </h3>

          <select
            onChange={(e) => handleAssignOutfit(e.target.value)}
            value={selectedOutfitsByDate[format(selectedDate, 'yyyy-MM-dd')] || ''}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '1rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              marginBottom: '20px',
            }}
            className='outfit-assign'
          >
            <option value="">-- Select Outfit --</option>
            {outfits.map((outfit) => (
              <option key={outfit.id} value={outfit.id}>
                {outfit.outfitName || `Outfit ${outfit.id}`}
              </option>
            ))}
          </select>
          
          {selectedOutfitsByDate[format(selectedDate, 'yyyy-MM-dd')] && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                marginTop: '20px',
              }}
            >
              {['topImageUrl', 'bottomImageUrl', 'shoesImageUrl'].map((key) => {
                const outfit = outfits.find(o => o.id === selectedOutfitsByDate[format(selectedDate, 'yyyy-MM-dd')]);
                return outfit?.[key] ? (
                  <img
                    key={key}
                    src={outfit[key]}
                    alt={key}
                    style={{
                      width: '150px',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '10px',
                      border: '1px solid #ccc',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                      transition: 'transform 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                ) : null;
              })}
            </div>
          )}

          <div style={{ textAlign: 'right' }}>
            <button
              onClick={handleSave}
              className="outfit-button"
            >
              Save Planner
            </button>
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

    </div>
  );
}

export default Planner;