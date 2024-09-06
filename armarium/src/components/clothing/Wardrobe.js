import React, { useState, useEffect } from 'react';
import { db } from '../backend/firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { NavLink, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';

const Wardrobe = () => {
    const [tops, setTops] = useState([]);
    const [bottoms, setBottoms] = useState([]);
    const [isTop, setIsTop] = useState(true);
    const [isBottom, setIsBottom] = useState(false);
    const [isDelete, setIsDelete] = useState(false);
    const [clothesToDelete, setClothesToDelete] = useState([]);
    const navigate = useNavigate();
    const DELAY = 2000;
    
    //TODO: ADD IN REFRESH FOR LATER & SAVE THE TAB (TOP OR BOTTOM) INTO LOCAL STORAGE.
    // ALSO ADD IN A LOADING ANIMATION AT SOMEPOINT
    useEffect(() => {
      const fetchData = async () => {
          // Simulate a delay
          await new Promise(resolve => setTimeout(resolve, DELAY));
          
          if (tops.length === 0) { // Check if data is already loaded
              const topsCollection = await getDocs(collection(db, 'ItemsCollection/top/items'));
              const topsData = topsCollection.docs.map(doc => ({
                  id: doc.id,
                  url: doc.data().url
              }));
              setTops(topsData);
          }
  
          if (bottoms.length === 0) { // Check if data is already loaded
              const bottomsCollection = await getDocs(collection(db, 'ItemsCollection/bottom/items'));
              const bottomsData = bottomsCollection.docs.map(doc => ({
                  id: doc.id,
                  url: doc.data().url
              }));
              setBottoms(bottomsData);
          }
      };
      
      fetchData();
  }, []);

      const handleDelete = async (id, type) => {
        if (!clothesToDelete.length) {
            alert("No item has been selected.")
            return;
        }

        await new Promise(resolve => setTimeout(resolve, DELAY));
        for (let { id, type } of clothesToDelete) {
          const itemDoc = doc(db, `ItemsCollection/${type}/items`, id);
          await deleteDoc(itemDoc);
  
          if (type === 'top') {
            setTops(tops.filter((item) => item.id !== id));
          }
          else {
            setBottoms(bottoms.filter((item) => item.id !== id));
          }
        }

        setClothesToDelete([]);
        setIsDelete(false);
      }

      const addToDeleteList = (clothing) => {
        setClothesToDelete(prevList => {
          if (prevList.some(item => item.id === clothing.id)) {
              return prevList.filter(item => item.id !== clothing.id);
          } else {
              return [...prevList, clothing];
          }
      });
      }

      const handleDeleteClick = (id, type) => {
        console.log('Type: ',type)
        if (isDelete) {
            addToDeleteList({ id, type });
        } else {
            console.log(type);
            navigate(`/editClothing/${id.id}/${id.type}`); // This weird naming but it works.
        }
    };

      const handleShowTops = () => {
        setIsTop(true);
        setIsBottom(false);
      };
    
      const handleShowBottoms = () => {
        setIsTop(false);
        setIsBottom(true);
      };

      const toggleDelete = () => {
        if (isDelete) {
            setClothesToDelete([]);
        }
        setIsDelete(!isDelete);
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
            <button onClick={toggleDelete}>
                {isDelete ? 'Cancel' : 'Delete'}
            </button>
            {isDelete && (
                <button onClick={handleDelete} style={{ marginLeft: '10px' }}>
                    Confirm Delete
                </button>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {isTop && tops.map((top, index) => (
                    <div key={top.id} style={{ position: 'relative' }}>
                        <img 
                            src={top.url} 
                            alt={`Top ${index + 1}`} 
                            style={{ 
                                width: '150px', 
                                height: 'auto', 
                                border: clothesToDelete.some(item => item.id === top.id) ? '2px solid red' : 'none'
                            }}
                            onClick={() => handleDeleteClick({ id: top.id, type: 'top' })}
                        />
                        {isDelete && (
                            <button
                                onClick={() => addToDeleteList({ id: top.id, type: 'top' })}
                                style={{
                                    position: 'absolute',
                                    top: '5px',
                                    right: '5px',
                                    backgroundColor: 'red',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {clothesToDelete.some(item => item.id === top.id) ? 'Remove' : 'Select'}
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {isBottom && bottoms.map((bottom, index) => (
                    <div key={bottom.id} style={{ position: 'relative' }}>
                        <img 
                            src={bottom.url} 
                            alt={`Bottom ${index + 1}`} 
                            style={{ 
                                width: '150px', 
                                height: 'auto', 
                                border: clothesToDelete.some(item => item.id === bottom.id) ? '2px solid red' : 'none'
                            }}
                            onClick={() => handleDeleteClick({ id: bottom.id, type: 'bottom' })}
                        />
                        {isDelete && (
                            <button
                                onClick={() => addToDeleteList({ id: bottom.id, type: 'bottom' })}
                                style={{
                                    position: 'absolute',
                                    top: '5px',
                                    right: '5px',
                                    backgroundColor: 'red',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {clothesToDelete.some(item => item.id === bottom.id) ? 'Remove' : 'Select'}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wardrobe;
