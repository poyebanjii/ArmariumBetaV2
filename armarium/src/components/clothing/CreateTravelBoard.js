import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig';
import Navbar from '../Navbar';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import '../styles/CreateTravelBoard.css';
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
    <div className="create-travel-board-container">
      <h2 className="create-travel-board-header">Create a Travel Board</h2>

      <div className="form-group">
        <label className="form-label">Title</label>
        <input
          type="text"
          value={title}
          placeholder="e.g. Spring Break Trip"
          onChange={(e) => setTitle(e.target.value)}
          className="form-input"
          required
        />
      </div>

      <div className="date-range-container">
        <DateRange
          editableDateInputs={true}
          onChange={(item) => setRange([item.selection])}
          moveRangeOnFirstSelection={false}
          ranges={range}
        />
      </div>

      <div className="form-group">
        <h3 className="outfits-title">Select Outfits for Each Day</h3>
        {travelDates.map((date, index) => (
          <div key={index} className="outfit-selector">
            <span className="outfit-selector-date">{format(new Date(date), 'EEEE, MMMM do')}</span>
            <select
              value={selectedOutfitsByDate[date] || ''}
              onChange={(e) => handleOutfitChange(date, e.target.value)}
              className="outfit-selector-select"
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
      </div>

      <button
        onClick={handleTravelBoardCreation}
        className="create-travel-board-button"
      >
        Create Travel Board
      </button>
    </div>
  );
}

export default CreateTravelBoard;
