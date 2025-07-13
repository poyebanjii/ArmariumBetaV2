import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import '../styles/CreateAOutfit.css';
import '../styles/Modal.css';
import Navbar from '../Navbar';
import Loader from '../Loader';
import { collection, getDoc, getDocs, addDoc, getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth, db, storage } from '../backend/firebaseConfig';
import { useNavigate, useLocation  } from 'react-router-dom';
import Joyride from 'react-joyride';
import ItemUpload from './itemUpload';

/**
 * The swipeable component for tops, bottoms, top layers, and accessories
 * @param {Image URL to display} image 
 * @param {Function to handle swipes} handleSwipe
 * @param {Boolean for locking} isLocked
 * @returns the swipeable image.
 */
const SwipeableImage = ({ image, handleSwipe, isLocked, isAllLocked, handleSwipeAll, itemLength }) => {
  const motionValue = useMotionValue(0);
  const rotateValue = useTransform(motionValue, [-150, 150], [-10, 10]);
  const opacityValue = useTransform(motionValue, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const animControls = useAnimation();

  return (
    <motion.div
      drag={!isAllLocked && isLocked ? false : itemLength > 1 ? "x" : false} 
      dragConstraints={{ left: -1000, right: 1000 }}
      id="swipeable-container"
      style={{
        width: '100%',
        height: '100%',
        x: motionValue,
        rotate: rotateValue,
        opacity: opacityValue
      }}
      onDragEnd={(event, info) => {
        if (Math.abs(info.point.x) <= 10) {
          animControls.start({ x: 0, rotate: 0, opacity: 1 });
        } else {
          const direction = info.offset.x < 0 ? "left" : "right";
          animControls.start({
            x: direction === "left" ? -1000 : 1000,
            rotate: direction === "left" ? -20 : 20,
            opacity: 0
          }).then(() => {
            if (isAllLocked) {
              handleSwipeAll(direction);
            } else {
              handleSwipe(direction);
            }
            animControls.start({ x: 0, rotate: 0, opacity: 1 });
          });
        }
      }}
    >
      <img
        src={image}
        alt="Clothing item"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        onDragStart={(e) => e.preventDefault()} 
        id="swipeable-image"
      />
    </motion.div>
  );
};

/**
 * The tinder-style page for users to swipe left or right on clothing items.
 * @returns Outfit page.
 */
function Outfit() {
  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);
  const [shoesIndex, setShoesIndex] = useState(0);
  const [topLayerIndex, setTopLayerIndex] = useState(0);
  const [accessoryIndex, setAccessoryIndex] = useState(0);
  const [tops, setTops] = useState([]);
  const [bottoms, setBottoms] = useState([]);
  const [shoes, setShoes] = useState([]);
  const [topLayers, setTopLayers] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [isLocked, setIsLocked] = useState({ top: false, bottom: false, shoes: false, all: false });
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTopLayers, setSelectedTopLayers] = useState([]);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [showLayers, setShowLayers] = useState(false);
  const DELAY = 650;
  const user = auth.currentUser;
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showLockDropdown, setShowLockDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [runTour, setRunTour] = useState(false);
  const [steps, setSteps] = useState([]);
  const location = useLocation();

  const [selectedType, setSelectedType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const TABS = {
    TOPS: 'Tops',
    BOTTOMS: 'Bottoms',
    SHOES: 'Shoes',
    LAYERS: 'Layers',
    ACCESSORIES: 'Accessories',
  };

  const [tabContent, setTabContent] = useState(TABS.TOPS);


  useEffect(() => {
    if (location.state?.startTutorial) {
      setSteps([
      {
        target: '.main-content',
        content: 'This is where you can create outfits. You can swipe through clothing items and save outfits.',
        placement: 'center',
        disableBeacon: true,
      },
      {
        target: '#homepage',
        content: 'This is the main area where you can browse and create outfits by swiping left or right on the clothing items.',
        placement: 'left',
      },
      {
        target: '.lock-sidebar-icon',
        content: 'Lock items you like to keep them while browsing other categories.',
        placement: 'bottom',
      },
      {
        target: '.flip-image',
        content: 'Toggle between base layers and accessories with this button.',
        placement: 'top',
      },
      {
        target: '.one-lock-btn',
        content: 'This here toggles a one lock where you can swipe one clothing item and the others get swiped as well.',
        placement: 'top',
      },
      {
        target: '.bottom-tab',
        content: 'If you prefer to click on the clothing item, you can select which one to use from here. You can switch between clothing tabs.',
        placement: 'top',
      },
      {
        target: '.save-image',
        content: 'Love your outfit? Save it with a name to your collection!',
        placement: 'bottom',
      }
      ]);
      setRunTour(true);
    }
  }, [location]);

  const fetchData = async (user) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, DELAY));
    if (tops.length === 0) {
      const topsCollection = await getDocs(collection(db, `Users/${user.uid}/ItemsCollection/top/items`));
      const topsData = topsCollection.docs.map(doc => doc.data().url);
      setTops(topsData);
    }

    if (bottoms.length === 0) {
      const bottomsCollection = await getDocs(collection(db, `Users/${user.uid}/ItemsCollection/bottom/items`));
      const bottomsData = bottomsCollection.docs.map(doc => doc.data().url);
      setBottoms(bottomsData);
    }

    if (shoes.length === 0) {
      const shoesCollection = await getDocs(collection(db, `Users/${user.uid}/ItemsCollection/shoes/items`));
      const shoesData = shoesCollection.docs.map(doc => doc.data().url);
      setShoes(shoesData);
    }

    if (topLayers.length === 0) {
      const topLayersCollection = await getDocs(collection(db, `Users/${user.uid}/ItemsCollection/toplayer/items`));
      const topLayersData = topLayersCollection.docs.map(doc => doc.data().url);
      setTopLayers(topLayersData);
    }

    if (accessories.length === 0) {
      const accessoriesCollection = await getDocs(collection(db, `Users/${user.uid}/ItemsCollection/accessory/items`));
      const accessoriesData = accessoriesCollection.docs.map(doc => doc.data().url);
      setAccessories(accessoriesData);
    }
  }

  const handleSwipeTop = (direction) => {
    if (!isLocked.top && !isLocked.all && tops.length > 1) {
      if (direction === "left") {
        setTopIndex((prevIndex) => (prevIndex + 1) % tops.length);
      } else if (direction === "right") {
        setTopIndex((prevIndex) => (prevIndex - 1 + tops.length) % tops.length);
      }
    }
  };

  const handleSwipeBottom = (direction) => {
    if (!isLocked.bottom && !isLocked.all && bottoms.length > 1) {
      if (direction === "left") {
        setBottomIndex((prevIndex) => (prevIndex + 1) % bottoms.length);
      } else if (direction === "right") {
        setBottomIndex((prevIndex) => (prevIndex - 1 + bottoms.length) % bottoms.length);
      }
    }
  };

  const handleSwipeShoes = (direction) => {
    if (!isLocked.shoes && !isLocked.all && shoes.length > 1) {
      if (direction === "left") {
        setShoesIndex((prevIndex) => (prevIndex + 1) % shoes.length);
      } else if (direction === "right") {
        setShoesIndex((prevIndex) => (prevIndex - 1 + shoes.length) % shoes.length);
      }
    }
  };

  const finishTour = async () => {
    setRunTour(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData(user).then(() => setLoading(false));
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, []);

  const saveOutfit = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      alert('Please log in to save your outfit.');
      return;
    }
  
    try {
      // Save top image
      const topImage = tops[topIndex];
      const topImageRef = ref(storage, `Users/Outfits/${user.uid}/${outfitName}/tops/${Date.now()}_${topIndex}.jpg`);
      await uploadBytes(topImageRef, await fetch(topImage).then((r) => r.blob()));
      const topImageUrl = await getDownloadURL(topImageRef);
  
      // Save bottom image
      const bottomImage = bottoms[bottomIndex];
      const bottomImageRef = ref(storage, `Users/Outfits/${user.uid}/${outfitName}/bottoms/${Date.now()}_${bottomIndex}.jpg`);
      await uploadBytes(bottomImageRef, await fetch(bottomImage).then((r) => r.blob()));
      const bottomImageUrl = await getDownloadURL(bottomImageRef);
  
      // Save shoes image
      const shoesImage = shoes[shoesIndex];
      const shoesImageRef = ref(storage, `Users/Outfits/${user.uid}/${outfitName}/shoes/${Date.now()}_${shoesIndex}.jpg`);
      await uploadBytes(shoesImageRef, await fetch(shoesImage).then((r) => r.blob()));
      const shoesImageUrl = await getDownloadURL(shoesImageRef);
  
      // Save top layers
      const topLayerUrls = [];
      for (let i = 0; i < selectedTopLayers.length; i++) {
        const topLayerImage = selectedTopLayers[i];
        const topLayerRef = ref(storage, `Users/Outfits/${user.uid}/${outfitName}/toplayers/${Date.now()}_${i}.jpg`);
        await uploadBytes(topLayerRef, await fetch(topLayerImage).then((r) => r.blob()));
        const topLayerUrl = await getDownloadURL(topLayerRef);
        topLayerUrls.push(topLayerUrl);
      }
  
      // Save accessories
      const accessoryUrls = [];
      for (let i = 0; i < selectedAccessories.length; i++) {
        const accessoryImage = selectedAccessories[i];
        const accessoryRef = ref(storage, `Users/Outfits/${user.uid}/${outfitName}/accessories/${Date.now()}_${i}.jpg`);
        await uploadBytes(accessoryRef, await fetch(accessoryImage).then((r) => r.blob()));
        const accessoryUrl = await getDownloadURL(accessoryRef);
        accessoryUrls.push(accessoryUrl);
      }
  
      // Save outfit data to Firestore
      await addDoc(collection(db, `Users/${user.uid}/Outfits`), {
        topImageUrl,
        bottomImageUrl,
        shoesImageUrl,
        topLayerUrls,
        accessoryUrls,
        outfitName,
        timestamp: new Date(),
      });
  
      alert('Outfit saved successfully!');
      setShowModal(false);
      setOutfitName('');
      setSelectedTopLayers([]);
      setSelectedAccessories([]);
    } catch (error) {
      console.error('Error saving outfit:', error);
      alert('Error saving outfit. Please try again.');
    }
  };

  const handleSwipeAll = (direction) => {
    if (direction === "left") {
      setTopIndex((prevIndex) => (prevIndex + 1) % tops.length);
      setBottomIndex((prevIndex) => (prevIndex + 1) % bottoms.length);
      setShoesIndex((prevIndex) => (prevIndex + 1) % shoes.length);
    } else if (direction === "right") {
      setTopIndex((prevIndex) => (prevIndex - 1 + tops.length) % tops.length);
      setBottomIndex((prevIndex) => (prevIndex - 1 + bottoms.length) % bottoms.length);
      setShoesIndex((prevIndex) => (prevIndex - 1 + shoes.length) % shoes.length);
    }
  };

  const toggleLockTop = () => {
    setIsLocked((prevState) => ({
      ...prevState,
      top: !prevState.top,
      all: false, // Disable global lock 
    }));
  };

  const toggleLockBottom = () => {
    setIsLocked((prevState) => ({
      ...prevState,
      bottom: !prevState.bottom,
      all: false, 
    }));
  };

  const toggleLockShoes = () => {
    setIsLocked((prevState) => ({
      ...prevState,
      shoes: !prevState.shoes,
      all: false, 
    }));
  };

  const toggleOneLock = () => {
    setIsLocked(prevState => {
      const newState = { ...prevState, all: !prevState.all };
      
      // If toggling to 'all locked', make sure individual locks are disabled
      if (newState.all) {
        newState.top = false;
        newState.bottom = false;
        newState.shoes = false;
      }
      
      return newState;
    });
  };

  const toggleLayers = () => {
    setShowLayers(prev => !prev);
  };

  const handleDeleteItem = (url, category) => {
    if (category === 'toplayer') {
      setSelectedTopLayers(prev => prev.filter(item => item !== url));
    } else if (category === 'accessory') {
      setSelectedAccessories(prev => prev.filter(item => item !== url));
    }
  };

  const handleShowModal = (type) => {
      setSelectedType(type);
      setIsModalOpen(true);
      document.body.classList.add('modal-open'); // Prevent scrolling
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      document.body.classList.remove('modal-open');
  };

  return (
    <div>
      <Navbar />
      <Loader loading={loading} />
      
      <div className="bottom-tab">
        <div className="tab-buttons">
          {Object.entries(TABS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTabContent(label)}
              className="tab-button"
              style={{
                backgroundColor: tabContent === label ? '#a52a2a' : 'white',
                color: tabContent === label ? 'white' : '#a52a2a',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="tab-content">
        <div className="wardrobe-row">
          {tabContent === TABS.TOPS && (
            <div className="wardrobe-content-row">
              <button className="add-nav-link" id="tops-add-button"onClick={() => handleShowModal('top')}>
                  +
              </button>
              {tops.map((top, index) => (
                <div
                  key={index}
                  className="wardrobe-item"
                  onClick={() => setTopIndex(index)}
                >
                  <img src={top} alt={`Top ${index + 1}`} className="wardrobe-image" />
                </div>
              ))}
            </div>
          )}

          {tabContent === TABS.BOTTOMS && (
            <div className="wardrobe-content-row">
              <button className="add-nav-link" id="tops-add-button"onClick={() => handleShowModal('bottom')}>
                  +
              </button>
              {bottoms.map((bottom, index) => (
                <div
                  key={index}
                  className="wardrobe-item"
                  onClick={() => setBottomIndex(index)}
                >
                  <img src={bottom} alt={`Bottom ${index + 1}`} className="wardrobe-image" />
                </div>
              ))}
            </div>
          )}

          {tabContent === TABS.SHOES && (
            <div className="wardrobe-content-row">
              <button className="add-nav-link" id="tops-add-button"onClick={() => handleShowModal('shoes')}>
                  +
              </button>
              {shoes.map((shoe, index) => (
                <div
                  key={index}
                  className="wardrobe-item"
                  onClick={() => setShoesIndex(index)}
                >
                  <img src={shoe} alt={`Shoe ${index + 1}`} className="wardrobe-image" />
                </div>
              ))}
            </div>
          )}

          {tabContent === TABS.LAYERS && (
            <div className="wardrobe-content-row">
              <button className="add-nav-link" id="tops-add-button"onClick={() => handleShowModal('toplayer')}>
                  +
              </button>
              {topLayers.map((layer, index) => (
                <div
                  key={index}
                  className="wardrobe-item"
                  onClick={() => {
                    const selected = topLayers[index];
                    if (!selectedTopLayers.includes(selected)) {
                      setSelectedTopLayers(prev => [...prev, selected]);
                    }
                  }}
                >
                  <img src={layer} alt={`Layer ${index + 1}`} className="wardrobe-image" />
                </div>
              ))}
            </div>
          )}

          {tabContent === TABS.ACCESSORIES && (
            <div className="wardrobe-content-row">
              <button className="add-nav-link" id="tops-add-button"onClick={() => handleShowModal('accessory')}>
                  +
              </button>
              {accessories.map((acc, index) => (
                <div
                  key={index}
                  className="wardrobe-item"
                  onClick={() => {
                    const selected = accessories[index];
                    if (!selectedAccessories.includes(selected)) {
                      setSelectedAccessories(prev => [...prev, selected]);
                    }
                  }}
                >
                  <img src={acc} alt={`Accessory ${index + 1}`} className="wardrobe-image" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      </div>

      <div className="App" id="homepage">
      <button onClick={toggleOneLock} className='one-lock-btn'>
        {isLocked.all ? 'Unlock All' : 'Lock All'}
      </button>

        <h1 className="outfits-title">
          <img
            src="save.png"
            alt="Save Outfit"
            onClick={() => setShowModal(true)} /* Opens the Save Outfit modal */
            className="save-image"
            style={{ cursor: "pointer" }}
          />
        </h1>
        <div className="header-buttons">
          {/* Lock All Button */}
          <div className="lock-sidebar">
            <img
              src="unlock.png"
              alt="Lock Options"
              onClick={() => setShowLockDropdown(prev => !prev)}
              className="lock-sidebar-icon"
              style={{ cursor: "pointer", width: "30px", marginRight: "10px" }}
            />

            {showLockDropdown && (
              <div className="lock-dropdown">
                <label>
                  <input
                    type="checkbox"
                    checked={isLocked.top}
                    onChange={toggleLockTop}
                  />
                    👕 Lock Tops
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={isLocked.bottom}
                    onChange={toggleLockBottom}
                  />
                   👖  Lock Bottoms
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={isLocked.shoes}
                    onChange={toggleLockShoes}
                  />
                  👟 Lock Shoes
                </label>
              </div>
            )}
          </div>
          {/* Add Modal Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="circle-btn"
          >
            <span className="plus-icon">+</span>
          </button>

          {/* Flip Button */}
          <img
            src="flip.png"
            alt="Flip"
            onClick={toggleLayers}
            className="flip-image"
            style={{ cursor: "pointer" }}
          />
        </div>

        <div className="main-content">
          {showAddModal && (
            <div className="modal-container">
              <div className="modal-content">
                <div className="modal-header">
                  <h3 className="modal-title">Add Top Layers and Accessories</h3>
                  <button type="button" className="close-btn" onClick={() => setShowAddModal(false)}>X</button>
                </div>
                <div className="modal-body">
                  <div className="swipeable-section">
                    <div className="swipeable-wrapper">
                      <div className="swipeable-container topLayer">
                        <h3>Top Layers</h3>
                        {topLayers.length > 0 ? (
                          <SwipeableImage
                            key={topLayerIndex}
                            image={topLayers[topLayerIndex]}
                            handleSwipe={(direction) => {
                              if (direction === "left") {
                                setTopLayerIndex((prevIndex) => (prevIndex + 1) % topLayers.length);
                              } else if (direction === "right") {
                                setTopLayerIndex((prevIndex) => (prevIndex - 1 + topLayers.length) % topLayers.length);
                              }
                            }}
                            isLocked={false}
                            isAllLocked={false}
                            itemLength={topLayers.length}
                          />
                        ) : (
                          <p>No top layers available.</p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          const selectedImage = topLayers[topLayerIndex];
                          if (!selectedTopLayers.includes(selectedImage)) {
                            setSelectedTopLayers((prev) => [...prev, selectedImage]);
                          }
                        }}
                        className="modal-action-btn"
                        disabled={topLayers.length === 0}
                      >
                        Add Top Layer
                      </button>
                    </div>
                    <div className="selected-items-box">
                      <h3>Selected Top Layers</h3>
                      <div className="selected-items">
                        {selectedTopLayers.map((url, index) => (
                          <div key={index} className="selected-item">
                            <img src={url} alt={`Top Layer ${index + 1}`} className="selected-image" />
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteItem(url, 'toplayer')}
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="swipeable-section">
                    <div className="swipeable-wrapper">
                      <div className="swipeable-container accessory">
                        <h3>Accessories</h3>
                        {accessories.length > 0 ? (
                          <SwipeableImage
                            key={accessoryIndex}
                            image={accessories[accessoryIndex]}
                            handleSwipe={(direction) => {
                              if (direction === "left") {
                                setAccessoryIndex((prevIndex) => (prevIndex + 1) % accessories.length);
                              } else if (direction === "right") {
                                setAccessoryIndex((prevIndex) => (prevIndex - 1 + accessories.length) % accessories.length);
                              }
                            }}
                            isLocked={false}
                            isAllLocked={false}
                            itemLength={accessories.length}
                          />
                        ) : (
                          <p>No accessories available.</p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          const selectedImage = accessories[accessoryIndex];
                          if (!selectedAccessories.includes(selectedImage)) {
                            setSelectedAccessories((prev) => [...prev, selectedImage]);
                          }
                        }}
                        className="modal-action-btn"
                        disabled={accessories.length === 0}
                      >
                        Add Accessory
                      </button>
                    </div>
                    <div className="selected-items-box">
                      <h3>Selected Accessories</h3>
                      <div className="selected-items">
                        {selectedAccessories.map((url, index) => (
                          <div key={index} className="selected-item">
                            <img src={url} alt={`Accessory ${index + 1}`} className="selected-image" />
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteItem(url, 'accessory')}
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="done-btn" onClick={() => setShowAddModal(false)}>
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="outfit-builder">
          {/* Top and Bottom Containers with Conditional Overlays */}
          {!showLayers ? (
            <>
              {/* Top Clothing Container */}
              <div className="clothing-container">
                <div className="swipeable-container top">
                  <SwipeableImage
                    key={topIndex}
                    image={tops[topIndex]}
                    handleSwipe={handleSwipeTop}
                    isLocked={isLocked.top || isLocked.all} 
                    isAllLocked={isLocked.all}
                    handleSwipeAll={handleSwipeAll}
                    itemLength={tops.length}
                    id="top-swipeable"
                  />
                </div>
              </div>

              {/* Bottom Clothing Container */}
              <div className="clothing-container">
                <div className="swipeable-container bottom">
                  <SwipeableImage
                    key={bottomIndex}
                    image={bottoms[bottomIndex]}
                    handleSwipe={handleSwipeBottom}
                    isLocked={isLocked.bottom || isLocked.all} 
                    isAllLocked={isLocked.all}
                    handleSwipeAll={handleSwipeAll}
                    itemLength={bottoms.length}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Top Layer Overlay */}
              <div className="clothing-container">
                <div className="swipeable-container top">
                  <SwipeableImage
                    key={topIndex}
                    image={tops[topIndex]}
                    handleSwipe={handleSwipeTop}
                    isLocked={isLocked.top || isLocked.all} 
                    isAllLocked={isLocked.all}
                    handleSwipeAll={handleSwipeAll}
                    itemLength={tops.length}
                  />
                  <div className="overlay-container">
                    <h3>Selected Top Layers</h3>
                    <div className="overlay-items">
                      {selectedTopLayers.length > 0 ? (
                        selectedTopLayers.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Top Layer ${index + 1}`}
                            className="overlay-image"
                          />
                        ))
                      ) : (
                        <p>No top layers selected.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Accessory Overlay */}
              <div className="clothing-container">
                <div className="swipeable-container bottom">
                  <SwipeableImage
                    key={bottomIndex}
                    image={bottoms[bottomIndex]}
                    handleSwipe={handleSwipeBottom}
                    isLocked={isLocked.bottom || isLocked.all} 
                    isAllLocked={isLocked.all}
                    handleSwipeAll={handleSwipeAll}
                    itemLength={bottoms.length}
                  />
                  <div className="overlay-container">
                    <h3>Selected Accessories</h3>
                    <div className="overlay-items">
                      {selectedAccessories.length > 0 ? (
                        selectedAccessories.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Accessory ${index + 1}`}
                            className="overlay-image"
                          />
                        ))
                      ) : (
                        <p>No accessories selected.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {/* Shoes Container (Always Visible) */}
          <div className="clothing-container">
            <div className="swipeable-container shoes">
              <SwipeableImage
                key={shoesIndex}
                image={shoes[shoesIndex]}
                handleSwipe={handleSwipeShoes}
                isLocked={isLocked.shoes || isLocked.all}  
                isAllLocked={isLocked.all}
                handleSwipeAll={handleSwipeAll}
                itemLength={shoes.length}
              />
            </div>
          </div>
        </div>
        </div>
      </div>
      <div className={`modal ${showModal ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Save Outfit</h5>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="form-control"
                placeholder="Outfit name"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-danger" onClick={saveOutfit}>Save</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <Joyride
        steps={steps}
        run={runTour}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        callback={(data) => {
          if (data.status === 'finished' || data.status === 'skipped') {
            finishTour();
          }
        }}
      />

      {isModalOpen && (
          <div className="modal-overlay">
              <div className="modal-content">
                  <ItemUpload type={selectedType} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                      <button className="modal-close" onClick={handleCloseModal}>Close</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

export default Outfit;