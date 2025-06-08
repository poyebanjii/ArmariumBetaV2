import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig';
import Navbar from '../Navbar';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { differenceInCalendarDays, eachDayOfInterval, format, addDays } from 'date-fns';

function CreateTravelBoard() {
  const auth = getAuth();
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 2),
      key: 'selection',
    },
  ]);
  const [title, setTitle] = useState('');
  const [outfits, setOutfits] = useState([]);
  const [selectedOutfitsByDate, setSelectedOutfitsByDate] = useState({});
  const [user, setUser] = useState(null);

  const selectedStart = range[0].startDate;
  const selectedEnd = range[0].endDate;
  const formattedStart = format(selectedStart, 'yyyy-MM-dd');
  const formattedEnd = format(selectedEnd, 'yyyy-MM-dd');

  const travelDates = eachDayOfInterval({ start: selectedStart, end: selectedEnd })
    .map((date) => format(date, 'yyyy-MM-dd'));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const outfitSnapshot = await getDocs(collection(db, `Users/${currentUser.uid}/Outfits`));
        const outfitList = outfitSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setOutfits(outfitList);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleOutfitChange = (date, outfitId) => {
    setSelectedOutfitsByDate((prev) => ({ ...prev, [date]: outfitId }));
  };

    const handleTravelBoardCreation = async () => {
    if (!user || !title.trim()) {
        alert("Please enter a travel board title.");
        return;
    }

    try {
        const outfitsPerDay = {};
        for (const date in selectedOutfitsByDate) {
        const outfitId = selectedOutfitsByDate[date];
        const outfit = outfits.find(o => o.id === outfitId);

        if (outfit) {
            outfitsPerDay[date] = {
            id: outfit.id,
            outfitName: outfit.outfitName || '',
            topImageUrl: outfit.topImageUrl || '',
            bottomImageUrl: outfit.bottomImageUrl || '',
            shoesImageUrl: outfit.shoesImageUrl || '',
            topLayerUrls: outfit.topLayerUrls || [],
            accessoryUrls: outfit.accessoryUrls || [],
            };
        }
        }

        const travelBoardData = {
        userId: user.uid,
        title: title.trim(),
        createdAt: new Date(),
        startDate: formattedStart,
        endDate: formattedEnd,
        outfitsPerDay,
        };

        await addDoc(collection(db, `Users/${user.uid}/TravelBoards`), travelBoardData);
        alert('Travel board created!');
        setTitle('');
        setSelectedOutfitsByDate({});
    } catch (error) {
        console.error('Failed to create travel board:', error);
        alert('Error saving travel board.');
    }
    };


  return (
    <div>
      <div className="Form-box" style={{ padding: '20px' }}>
        <h2>Create a Travel Board</h2>

        <label style={{ display: 'block', marginBottom: '10px' }}>
          Title:
          <input
            type="text"
            value={title}
            placeholder="e.g. Spring Break Trip"
            onChange={(e) => setTitle(e.target.value)}
            style={{
              marginLeft: '10px',
              padding: '6px',
              fontSize: '16px',
              width: '250px',
            }}
            required
          />
        </label>


        {travelDates.map((date, index) => (
          <div key={index} className="day-outfit-select" style={{ marginBottom: '10px' }}>
            <h4>{date}</h4>
            <select
              value={selectedOutfitsByDate[date] || ''}
              onChange={(e) => handleOutfitChange(date, e.target.value)}
              style={{ padding: '6px', fontSize: '14px' }}
            >
              <option value="">Select Outfit</option>
              {outfits.map((outfit) => (
                <option key={outfit.id} value={outfit.id}>
                  {outfit.outfitName || `Outfit ${outfit.id}`}
                </option>
              ))}
            </select>
          </div>
        ))}

        <div className="calendar-wrapper" style={{ marginTop: '20px' }}>
          <DateRange
            editableDateInputs={true}
            onChange={(item) => setRange([item.selection])}
            moveRangeOnFirstSelection={false}
            ranges={range}
          />
        </div>

        <button
          className="outfit-button"
          onClick={handleTravelBoardCreation}
          style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}
        >
          Create Travel Board
        </button>
      </div>
    </div>
  );
}

export default CreateTravelBoard;
