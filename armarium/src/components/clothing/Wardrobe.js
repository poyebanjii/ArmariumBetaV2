import React, { useState, useEffect } from 'react';
import { db } from '../backend/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { NavLink } from 'react-router-dom';
import Navbar from '../Navbar';

const Wardrobe = () => {
    const [tops, setTops] = useState([]);
    const [bottoms, setBottoms] = useState([]);
    const [isTop, setIsTop] = useState(true);
    const [isBottom, setIsBottom] = useState(false);

    useEffect(() => {
        // Fetching tops from Firestore
        const fetchTops = async () => {
          const topsCollection = await getDocs(collection(db, 'ItemsCollection/top/items'));
          const topsData = topsCollection.docs.map(doc => doc.data().url); 
          setTops(topsData);
        };
      
        // Fetching bottoms from Firestore
        const fetchBottoms = async () => {
          const bottomsCollection = await getDocs(collection(db, 'ItemsCollection/bottom/items'));
          const bottomsData = bottomsCollection.docs.map(doc => doc.data().url); 
          setBottoms(bottomsData);
        };
      
        fetchTops();
        fetchBottoms();
      }, []);

      const handleShowTops = () => {
        setIsTop(true);
        setIsBottom(false);
      };
    
      const handleShowBottoms = () => {
        setIsTop(false);
        setIsBottom(true);
      };


      return (
        <div>
          <Navbar />
          <NavLink onClick={handleShowTops} style={{ marginRight: '10px', cursor: 'pointer' }}>
        Tops
      </NavLink>
      <NavLink onClick={handleShowBottoms} style={{ cursor: 'pointer' }}>
        Bottoms
      </NavLink>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {isTop && tops.map((topUrl, index) => (
              <img key={index} src={topUrl} alt={`Top ${index + 1}`} style={{ width: '150px', height: 'auto' }} />
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {isBottom && bottoms.map((bottomUrl, index) => (
              <img key={index} src={bottomUrl} alt={`Bottom ${index + 1}`} style={{ width: '150px', height: 'auto' }} />
            ))}
          </div>
        </div>
      );
};

export default Wardrobe;
