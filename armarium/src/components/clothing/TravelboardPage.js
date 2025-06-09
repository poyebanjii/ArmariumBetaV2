import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import OutfitsList from './OutfitsList';

function TravelboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { travelBoard } = location.state || {};

  const [selectedOutfits, setSelectedOutfits] = useState([]);

  if (!travelBoard) {
    return <p style={{ textAlign: 'center' }}>Travel board not found.</p>;
  }

  const outfits = Object.values(travelBoard.outfitsPerDay || {});

  return (
    <div>
      <Navbar />
      <button onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
        Back to Travel Boards
      </button>

      <div className="center">
        <h2>{travelBoard.title}</h2>
        <p><strong>Trip Dates:</strong> {travelBoard.startDate} → {travelBoard.endDate}</p>
      </div>

      <div className="center">
        <div className="outfit-outer">
          <div className="outfit-center">
            <OutfitsList
              outfits={outfits}
              selectedOutfits={selectedOutfits}
              setSelectedOutfits={setSelectedOutfits}
              existingOutfitIds={[]} // You can modify this if needed
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TravelboardPage;