import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MyOutfits.css';

function OutfitsList({ outfits, selectedOutfits, setSelectedOutfits, existingOutfitIds = [], disableCheckboxes = false, groupByDate = null }) {
  const navigate = useNavigate();

  const handleCheckboxClick = (event, outfit, isDisabled) => {
    event.stopPropagation();
    if (isDisabled) return;

    if (event.target.checked) {
      setSelectedOutfits((prevList) => [...prevList, outfit]);
    } else {
      setSelectedOutfits((prevList) => prevList.filter((item) => item.id !== outfit.id));
    }
  };

  const isSelected = (id) => selectedOutfits.some((item) => item.id === id);

  if (!outfits || outfits.length === 0) {
    return <p>No outfits found.</p>;
  }

    // 📌 Special TravelBoard layout
  if (groupByDate) {
    const sortedDates = Object.keys(groupByDate).sort((a, b) => new Date(a) - new Date(b));

    return (
      <div
        className="outfit-outer"
        style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}
      >
        {sortedDates.map((date) => {
          const outfit = groupByDate[date];
          if (!outfit) return null;

          return (
            <div
              key={date}
              className="outfit-column"
              style={{
                border: '1px solid #ccc',
                borderRadius: '10px',
                padding: '10px',
                textAlign: 'center',
                width: '160px',
                backgroundColor: '#fff',
              }}
            >
              <h4>{date}</h4>
              <div className="image-container">
                {outfit.topImageUrl && (
                  <img src={outfit.topImageUrl} alt="Top" className="outfit-image center" />
                )}
                {outfit.bottomImageUrl && (
                  <img src={outfit.bottomImageUrl} alt="Bottom" className="outfit-image center" />
                )}
                {outfit.shoesImageUrl && (
                  <img src={outfit.shoesImageUrl} alt="Shoes" className="outfit-image center" />
                )}
              </div>
              <p style={{ marginTop: '10px', fontWeight: 'bold' }}>
                {outfit.outfitName || 'Untitled Outfit'}
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <ul className="outfits-list">
      {outfits.map((outfit) => {
        const alreadyInStyleboard = existingOutfitIds.includes(outfit.id);
        const selected = isSelected(outfit.id);

        return (
          <li
            key={outfit.id}
            className={`outfit-item ${alreadyInStyleboard ? 'disabled' : ''}`}
            onClick={() => {
              if (!alreadyInStyleboard) {
                navigate(`/editOutfit/${outfit.id}`, {
                  state: { outfitName: outfit.outfitName, outfitId: outfit.id },
                });
              }
            }}
            style={{
              border: selected ? '2px solid blue' : '2px solid whitesmoke',
              opacity: alreadyInStyleboard ? 0.5 : 1,
              cursor: alreadyInStyleboard ? 'not-allowed' : 'pointer',
            }}
          >
            {!disableCheckboxes && (
              <input
                type="checkbox"
                className="select-box"
                checked={selected}
                disabled={alreadyInStyleboard}
                onClick={(event) => handleCheckboxClick(event, outfit, alreadyInStyleboard)}
              />
            )}

            <div className="image-container">
              <img src={outfit.topImageUrl} alt="Top" className="outfit-image center" />
              <img src={outfit.bottomImageUrl} alt="Bottom" className="outfit-image center" />
              <img src={outfit.shoesImageUrl} alt="Shoes" className="outfit-image center" />
            </div>

            <h1 className="outfit-title">
              {outfit.outfitName}
              {alreadyInStyleboard && (
                <span style={{ color: '#888', fontSize: '0.75rem', marginLeft: '5px' }}>
                  (Already in styleboard)
                </span>
              )}
            </h1>
          </li>
        );
      })}
    </ul>
  );
}

export default OutfitsList;