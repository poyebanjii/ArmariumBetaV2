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

  const handleDownloadCombinedOutfit = async (outfit) => {
    const imageUrls = [outfit.topImageUrl, outfit.bottomImageUrl, outfit.shoesImageUrl].filter(Boolean);

    try {
      // Load images
      const images = await Promise.all(
        imageUrls.map(
          (url) =>
            new Promise((resolve, reject) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => resolve(img);
              img.onerror = reject;
              img.src = url;
            })
        )
      );

      const ITEM_WIDTH = 400;
      const ITEM_HEIGHT = 400;

      const canvasWidth = ITEM_WIDTH;
      const canvasHeight = ITEM_HEIGHT * images.length;

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      const ctx = canvas.getContext('2d');

      let yOffset = 0;
      images.forEach((img) => {
        ctx.drawImage(img, 0, yOffset, ITEM_WIDTH, ITEM_HEIGHT);
        yOffset += ITEM_HEIGHT;
      });

      // Convert canvas to image
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${outfit.outfitName || 'outfit'}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Error combining outfit images:', error);
      alert('Failed to download outfit image.');
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
              onClick={() => {
              navigate(`/editOutfit/${outfit.id}`, {
                state: { outfitName: outfit.outfitName, outfitId: outfit.id },
              });
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
            <img src={outfit.topImageUrl} alt="Top" className="outfit-image" />
            <img src={outfit.bottomImageUrl} alt="Bottom" className="outfit-image" />
            <img src={outfit.shoesImageUrl} alt="Shoes" className="outfit-image" />
          </div>

          <h2 className="outfit-title">{outfit.outfitName}</h2>

          <div className="outfit-footer">
            {alreadyInStyleboard && (
              <span className="already-in-styleboard">
                (Already in styleboard)
              </span>
            )}
            <button
              className="download-outfit-button"
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadCombinedOutfit(outfit);
              }}
              disabled={alreadyInStyleboard}
            >
              Download
            </button>
          </div>
        </li>
        );
      })}
    </ul>
  );
}

export default OutfitsList;