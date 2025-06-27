import React, { useState, useEffect } from 'react';
import { DateRange } from 'react-date-range';
import { isSameDay } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import Navbar from '../Navbar';
import Loader from '../Loader';
import { db } from '../backend/firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';

function Planner() {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [outfits, setOutfits] = useState([]);
  const [selectedOutfitsByDate, setSelectedOutfitsByDate] = useState({});

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

  return (
    <div>
      <Navbar />
      <Loader loading={loading} />

      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
        {/* Calendar Side */}
        <div style={{
          width: '350px',
          marginRight: '40px',
          background: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Outfit Planner</h2>
          <p style={{ textAlign: 'center', fontSize: '0.95rem', color: '#555' }}>
            Select a day to assign an outfit
          </p>

          <DateRange
            onChange={handleSelect}
            moveRangeOnFirstSelection={false}
            ranges={[{ startDate: selectedDate, endDate: selectedDate, key: 'selection' }]}
            dayContentRenderer={(date) => {
              const formatted = format(date, 'yyyy-MM-dd');
              const isPlanned = !!selectedOutfitsByDate[formatted];
              return (
                <div style={{ position: 'relative' }}>
                  <span>{date.getDate()}</span>
                  {isPlanned && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 2,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#007bff',
                        borderRadius: '50%',
                      }}
                    />
                  )}
                </div>
              );
            }}
          />
        </div>

        {/* Outfit Selection Side */}
        <div style={{
          flex: 1,
          maxWidth: '500px',
          background: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
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
      </div>

    </div>
  );
}

export default Planner;