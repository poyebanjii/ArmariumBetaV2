import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css';

function Brands() {
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [customBrand, setCustomBrand] = useState('');
  const navigate = useNavigate();

  const brandsList = ['Gap', 'Nike', 'Lacoste', 'Raymond', 'Gucci', 'Ralph Lauren'];

  const handleBrandClick = (brand) => {
    setSelectedBrands((prevBrands) => 
      prevBrands.includes(brand)
        ? prevBrands.filter((b) => b !== brand)
        : [...prevBrands, brand]
    );
  };

  const handleCustomBrandChange = (e) => {
    setCustomBrand(e.target.value);
  };

  const handleCustomBrandSubmit = (e) => {
    e.preventDefault();
    if (customBrand && !selectedBrands.includes(customBrand)) {
      setSelectedBrands([...selectedBrands, customBrand]);
      setCustomBrand('');
    }
  };

  const handleNext = () => {
    navigate('/styles');
  };

  return (
    <div className="App">
      <h3>What brands do you like?</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
        {brandsList.map((brand) => (
          <button
            key={brand}
            onClick={() => handleBrandClick(brand)}
            style={{
              backgroundColor: selectedBrands.includes(brand) ? 'gray' : 'lightgray',
              padding: '10px 20px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {brand}
          </button>
        ))}
      </div>

      <form onSubmit={handleCustomBrandSubmit} style={{ marginTop: '20px' }}>
        <label style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ marginRight: '10px' }}>Insert your favorite brands:</span>
          <input
            type="text"
            value={customBrand}
            onChange={handleCustomBrandChange}
            placeholder="Enter brand name"
            style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </label>
        <button type="submit" style={{ display: 'block', margin: '10px auto' }}>
          Add Brand
        </button>
      </form>

      <button onClick={handleNext} style={{ display: 'block', margin: '20px auto' }}>
        Next
      </button>
    </div>
  );
}

export default Brands;
