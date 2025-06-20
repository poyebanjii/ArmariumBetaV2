import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { parseISO, format, eachDayOfInterval } from 'date-fns';
import { DateRange } from 'react-date-range';
import { getAuth } from 'firebase/auth';
import { db } from '../backend/firebaseConfig';
import { doc, updateDoc, getDocs, collection, getDoc } from 'firebase/firestore';
import Navbar from '../Navbar';
import '../styles/MyOutfits.css';

function TravelboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const [title, setTitle] = useState('');
  const { travelBoard } = location.state || {};

  const [range, setRange] = useState([
    {
      startDate: parseISO(travelBoard.startDate),
      endDate: parseISO(travelBoard.endDate),
      key: 'selection',
    },
  ]);
  const [outfitsList, setOutfitsList] = useState([]);
  const [outfitsPerDay, setOutfitsPerDay] = useState(travelBoard.outfitsPerDay || {});
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchUserOutfits = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snapshot = await getDocs(collection(db, `Users/${user.uid}/Outfits`));
      const outfitData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOutfitsList(outfitData);
      setTitle(travelBoard.title || '');
    };

    fetchUserOutfits();
  }, []);

  const allDates = eachDayOfInterval({
    start: range[0].startDate,
    end: range[0].endDate,
  }).map(d => format(d, 'yyyy-MM-dd'));

  const handleOutfitChange = (date, outfitId) => {
    const outfit = outfitsList.find(o => o.id === outfitId);
    if (!outfit) return;

    setOutfitsPerDay(prev => ({
      ...prev,
      [date]: {
        id: outfit.id,
        outfitName: outfit.outfitName,
        topImageUrl: outfit.topImageUrl,
        bottomImageUrl: outfit.bottomImageUrl,
        shoesImageUrl: outfit.shoesImageUrl,
      },
    }));
  };

  const handleSaveChanges = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const travelBoardRef = doc(db, `Users/${user.uid}/TravelBoards`, travelBoard.id);
      await updateDoc(travelBoardRef, {
        startDate: format(range[0].startDate, 'yyyy-MM-dd'),
        endDate: format(range[0].endDate, 'yyyy-MM-dd'),
        outfitsPerDay,
      });

      alert('Travel board updated!');
      setEditMode(false);
    } catch (error) {
      console.error('Error updating travel board:', error);
      alert('Failed to update travel board.');
    }
  };

  const handleTitleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userTravelRef = doc(db, `Users/${user.uid}/TravelBoards`, travelBoard.id);
      await updateDoc(userTravelRef, { name: title });


      alert('Travelboard title updated!');
    } catch (err) {
      console.error('Error updating title:', err);
      alert('Failed to update title.');
    }
  };

  return (
    <div>
      <Navbar />
      <button onClick={() => navigate(-1)} style={{ margin: '15px' }}>
        Back to Travel Boards
      </button>

      <div className="center">
        <div className="center">
        <input
          type="text"
          className="editable-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            fontSize: '2rem',
            textAlign: 'center',
            marginBottom: '10px',
            border: 'none',
            borderBottom: '2px solid gray',
            outline: 'none',
            width: '60%'
          }}
        />
        <button className="outfit-button" onClick={handleTitleSave}>Save Title</button>
      </div>
        <p>
          <strong>Trip Dates:</strong> {format(range[0].startDate, 'yyyy-MM-dd')} →{' '}
          {format(range[0].endDate, 'yyyy-MM-dd')}
        </p>

        <button className="outfit-button" onClick={() => setEditMode(!editMode)}>
          {editMode ? 'Cancel Edit' : 'Edit Trip'}
        </button>

        {editMode && (
          <button
            className="outfit-button"
            style={{ marginLeft: '10px' }}
            onClick={handleSaveChanges}
          >
            Save Changes
          </button>
        )}
      </div>

      {editMode && (
        <div className="calendar-wrapper center" style={{ marginTop: '20px' }}>
          <DateRange
            editableDateInputs={true}
            onChange={(item) => setRange([item.selection])}
            moveRangeOnFirstSelection={false}
            ranges={range}
          />
        </div>
      )}

      <div className="travel-grid center" style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {allDates.map((date) => {
          const outfit = outfitsPerDay[date];

          return (
            <div key={date} className="travel-day-card" style={{
              border: '1px solid #a52a2a',
              borderRadius: '8px',
              padding: '10px',
              margin: '10px',
              width: '180px',
              background: '#fff'
            }}
            >
              <h4 style={{ texRtAlign: 'center', marginBottom: '10px' }}>{date}</h4>

              {editMode ? (
                <select
                  value={outfit?.id || ''}
                  onChange={(e) => handleOutfitChange(date, e.target.value)}
                  style={{ width: '100%', marginBottom: '10px' }}
                >
                  <option value="">-- Select Outfit --</option>
                  {outfitsList.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.outfitName}
                    </option>
                  ))}
                </select>
              ) : outfit ? (
                    <div
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        navigate(`/editOutfit/${outfit.id}`, {
                          state: { outfitName: outfit.outfitName, outfitId: outfit.id, travelBoardId: travelBoard.id, },
                        });
                      }}
                    >
                      <img src={outfit.topImageUrl} alt="Top" style={{ width: '100%' }} />
                      <img src={outfit.bottomImageUrl} alt="Bottom" style={{ width: '100%' }} />
                      <img src={outfit.shoesImageUrl} alt="Shoes" style={{ width: '100%' }} />
                    </div>
              ) : (
                <p style={{ fontStyle: 'italic', color: '#999', textAlign: 'center' }}>
                  No outfit
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TravelboardPage;