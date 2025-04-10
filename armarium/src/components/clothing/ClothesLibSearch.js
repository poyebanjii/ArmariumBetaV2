import React, { useState } from 'react';
import Navbar from '../Navbar';
import '../styles/ClothesLibSearch.css';

const MOCK_CLOTHES = {
  tops: [
    { id: 1, name: 'Red T-Shirt', image: 'https://via.placeholder.com/100x120?text=Top+1' },
    { id: 2, name: 'White Blouse', image: 'https://via.placeholder.com/100x120?text=Top+2' },
    { id: 3, name: 'Denim Jacket', image: 'https://via.placeholder.com/100x120?text=Top+3' }
  ],
  bottoms: [
    { id: 4, name: 'Blue Jeans', image: 'https://via.placeholder.com/100x120?text=Bottom+1' },
    { id: 5, name: 'Black Skirt', image: 'https://via.placeholder.com/100x120?text=Bottom+2' },
    { id: 6, name: 'Cargo Pants', image: 'https://via.placeholder.com/100x120?text=Bottom+3' }
  ],
  shoes: [
    { id: 7, name: 'Sneakers', image: 'https://via.placeholder.com/100x120?text=Shoes+1' },
    { id: 8, name: 'Heels', image: 'https://via.placeholder.com/100x120?text=Shoes+2' },
    { id: 9, name: 'Boots', image: 'https://via.placeholder.com/100x120?text=Shoes+3' }
  ],
  other: [
    { id: 10, name: 'Hat', image: 'https://via.placeholder.com/100x120?text=Other+1' },
    { id: 11, name: 'Scarf', image: 'https://via.placeholder.com/100x120?text=Other+2' },
    { id: 12, name: 'Watch', image: 'https://via.placeholder.com/100x120?text=Other+3' }
  ]
};

const AddClothesPage = () => {
  const [category, setCategory] = useState('tops');
  const [selectedItems, setSelectedItems] = useState([]);

  const handleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleAddSelected = () => {
    console.log('Selected Items:', selectedItems); // Future use
  };

  const categories = ['tops', 'bottoms', 'shoes', 'other'];

  return (
    <div className="page-container">
      <Navbar />
      <div className="content-wrapper">
        <h1 className="main-heading">Select Items to Add to Your Wardrobe</h1>

        <div className="toolbar">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`toolbar-button ${category === cat ? 'active' : ''}`}
              onClick={() => {
                setCategory(cat);
                setSelectedItems([]);
              }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="cards-grid">
          {MOCK_CLOTHES[category].map(item => (
            <div
              key={item.id}
              className={`card ${selectedItems.includes(item.id) ? 'selected' : ''}`}
              onClick={() => handleSelectItem(item.id)}
            >
              <img src={item.image} alt={item.name} className="card-image" />
              <p className="card-name">{item.name}</p>
            </div>
          ))}
        </div>

        <div className="add-button-container">
          <button className="add-button" onClick={handleAddSelected}>
            Add Selected Items
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddClothesPage;
