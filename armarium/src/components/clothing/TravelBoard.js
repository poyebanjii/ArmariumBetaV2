import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig';
import Navbar from '../Navbar';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { differenceInCalendarDays, eachDayOfInterval, format, addDays } from 'date-fns';

function TravelBoard() {
  const auth = getAuth();
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 2),
      key: 'selection',
    },
  ]);
  const [outfits, setOutfits] = useState([]);
  const [selectedOutfitsByDate, setSelectedOutfitsByDate] = useState({});
  const [user, setUser] = useState(null);

  const selectedStart = range[0].startDate;
  const selectedEnd = range[0].endDate;
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
    if (!user) return;

    try {
      const travelBoardData = {
        userId: user.uid,
        createdAt: new Date(),
        startDate: selectedStart,
        endDate: selectedEnd,
        outfitsPerDay: selectedOutfitsByDate,
      };
      await addDoc(collection(db, `Users/${user.uid}/TravelBoards`), travelBoardData);
      alert('Travel board created!');
    } catch (error) {
      console.error('Failed to create travel board:', error);
      alert('Error saving travel board.');
    }
  };

  return (
    <div>
      <Navbar />

      <button
        className="outfit-button"
        onClick={handleTravelBoardCreation}
        style={{ marginLeft: '10px' }}
      >
        Create Travel Board
      </button>

      {travelDates.map((date, index) => (
        <div key={index} className="day-outfit-select">
          <h3>{date}</h3>
          <select
            value={selectedOutfitsByDate[date] || ''}
            onChange={(e) => handleOutfitChange(date, e.target.value)}
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

      <div className="calendar-wrapper">
        <DateRange
          editableDateInputs={true}
          onChange={(item) => setRange([item.selection])}
          moveRangeOnFirstSelection={false}
          ranges={range}
        />
      </div>
    </div>
  );
}

export default TravelBoard;
