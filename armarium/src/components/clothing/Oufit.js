import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion"; 
import '../styles/Outfits.css';
import Navbar from '../Navbar';
import { collection, getDocs,addDoc,getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { db, storage } from '../backend/firebaseConfig';

/**
 * The swipeable component for tops and bottoms
 * @param {Image to display} image 
 * @param {Function to handle swipes} handleSwipe
 * @param {Boolean for locking} isLocked
 * @returns the swipeable image.
 */
const SwipeableImage = ({ image, handleSwipe, isLocked, isAllLocked, handleSwipeAll, itemLength  }) => { 

  /**
  * Sample styling.
  */
  const style = { 
    backgroundImage: `url(${image})`,
    backgroundRepeat: "no-repeat", 
    backgroundSize: "contain", 
    backgroundPosition: "center",
    height: '100%',
  };

  /**
  * This moves the image for when the user wants to drag. 
  */
  const motionValue = useMotionValue(0);

  /**
   * This rotates the image.
   */
  const rotateValue = useTransform(motionValue, [-150, 150], [-10, 10]);

  /**
   * Decreases the opacity when swiping.
   */
  const opacityValue = useTransform(motionValue, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]); 

  /**
   * Framer animation hook.
   */
  const animControls = useAnimation();
  
  return ( 
    <motion.div
        drag={isLocked || itemLength <= 1 ? false : "x"}
        dragConstraints={{ left: -1000, right: 1000 }} 
        style={{
          ...style,
          x: motionValue,
          rotate: rotateValue,
          opacity: opacityValue
        }}
        onDragEnd={(event, info) => { 
            if (Math.abs(info.point.x) <= 10) { 
                animControls.start({ x: 0, rotate: 0, opacity: 1 });
            } 
            else { 
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
    />
  );
}

/**
 * The tinder style page for having users swipe left or right depending if they like the clothing item 
 * recommendation or not.
 * @returns Tinder page.
 */
function Outfit() {
  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);
  const [shoesIndex, setShoesIndex] = useState(0);
  const [tops, setTops] = useState([]);
  const [bottoms, setBottoms] = useState([]);
  const [shoes, setShoes] = useState([]);
  const [isLocked, setIsLocked] = useState({ top: false, bottom: false, shoes: false, all: false });
  const DELAY = 650;

  useEffect(() => {
    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      if (tops.length === 0) {
        const topsCollection = await getDocs(collection(db, 'ItemsCollection/top/items'));
        const topsData = topsCollection.docs.map(doc => doc.data().url); 
        setTops(topsData);
      }

      if (bottoms.length === 0) {
        const bottomsCollection = await getDocs(collection(db, 'ItemsCollection/bottom/items'));
        const bottomsData = bottomsCollection.docs.map(doc => doc.data().url); 
        setBottoms(bottomsData);
      }

      if (shoes.length === 0) {
        const shoesCollection = await getDocs(collection(db, 'ItemsCollection/shoes/items'));
        const shoesData = shoesCollection.docs.map(doc => doc.data().url); 
        setShoes(shoesData);
      }
    }
    fetchData();
  }, []);

  const handleSwipeTop = (direction) => {
    if (!isLocked.top && !isLocked.all && tops.length > 1) {
      if (direction === "left") {
        setTopIndex((prevIndex) => (prevIndex + 1) % tops.length);
      } else if (direction === "right") {
        setTopIndex((prevIndex) => (prevIndex - 1 + tops.length) % tops.length);
      }
      console.log('New Tops:', topIndex);
    }
  };

  const handleSwipeBottom = (direction) => {
    if (!isLocked.bottom && !isLocked.all && bottoms.length > 1) {
      if (direction === "left") {
        setBottomIndex((prevIndex) => (prevIndex + 1) % bottoms.length);
      } else if (direction === "right") {
        setBottomIndex((prevIndex) => (prevIndex - 1 + bottoms.length) % bottoms.length);
      }
      console.log('New Bottoms:', bottomIndex);
    }
  };

  const handleSwipeShoes = (direction) => {
    console.log("Shoes length", shoes.length);
    if (!isLocked.shoes && !isLocked.all && shoes.length > 1) {
      if (direction === "left") {
        setShoesIndex((prevIndex) => (prevIndex + 1) % shoes.length);
      } else if (direction === "right") {
        setShoesIndex((prevIndex) => (prevIndex - 1 + shoes.length) % shoes.length);
      }
      console.log('New Shoes:', shoesIndex);
    }
  };

  const saveOutfit = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert('Please log in to save your outfit.');
      return;
    }

    try {
      //Rewrite to save itemid instead of url to user's outfits collection
      // Upload top image
      const topImage = tops[topIndex];
      const topImageRef = ref(storage, `Users/${user.uid}/tops/${Date.now()}_${topIndex}.jpg`);
      await uploadBytes(topImageRef, await fetch(topImage).then(r => r.blob()));
      const topImageUrl = await getDownloadURL(topImageRef);
      
      
      
      // Upload bottom image
      const bottomImage = bottoms[bottomIndex];
      const bottomImageRef = ref(storage, `Users/${user.uid}/bottoms/${Date.now()}_${bottomIndex}.jpg`);
      await uploadBytes(bottomImageRef, await fetch(bottomImage).then(r => r.blob()));
      const bottomImageUrl = await getDownloadURL(bottomImageRef);

      await addDoc(collection(db, `Users/${user.uid}/Outfits`), {
        topImageUrl,
        bottomImageUrl,
        timestamp: new Date()
      });

      console.log('Top Image URL:', topImageUrl);
      console.log('Bottom Image URL:', bottomImageUrl);
    
      // Store URLs in Firestore
    
      console.log('Outfit saved successfully');
      alert('Outfit saved successfully!');
    } catch (error) {
      console.error('Error saving outfit:', error);
      alert('Error saving outfit. Please try again.');
    }
  };

  const handleSwipeAll = (direction) => {
    if (isLocked.all) {
      if (direction === "left") {
        setTopIndex((prevIndex) => (prevIndex + 1) % tops.length);
        setBottomIndex((prevIndex) => (prevIndex + 1) % bottoms.length);
        setShoesIndex((prevIndex) => (prevIndex + 1) % shoes.length);
      } else if (direction === "right") {
        setTopIndex((prevIndex) => (prevIndex - 1 + tops.length) % tops.length);
        setBottomIndex((prevIndex) => (prevIndex - 1 + bottoms.length) % bottoms.length);
        setShoesIndex((prevIndex) => (prevIndex + 1) % shoes.length);
      }
      console.log('New Bottoms:', bottomIndex);
      console.log('New1');
    }
  }

  const toggleLockTop = () => {
    setIsLocked(prevState => ({ ...prevState, top: !prevState.top }));
  };

  const toggleLockBottom = () => {
    setIsLocked(prevState => ({ ...prevState, bottom: !prevState.bottom }));
  };

  const toggleLockShoes = () => {
    setIsLocked(prevState => ({ ...prevState, shoes: !prevState.shoes }));
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

  return ( 
    <div>
      <Navbar />
      <div className='App'> 
      <h1>Outfits</h1>
      <button onClick={toggleOneLock}>
        {isLocked.all ? 'Unlock All' : 'Lock All'}
      </button>
      <br></br>
      <button onClick={toggleLockTop} disabled={isLocked.all}>
        {isLocked.top ? 'Unlock Top' : 'Lock Top'}
      </button>
      <div className="outfit-card">
        <div className="swipeable-container top">
          <SwipeableImage 
            key={topIndex}
            image={tops[topIndex]} 
            handleSwipe={handleSwipeTop} 
            isLocked={isLocked.top}
            isAllLocked={isLocked.all}
            handleSwipeAll={handleSwipeAll}
            itemLength={tops.length} 
          />
          </div>
        <div className="swipeable-container bottom">
          <SwipeableImage 
            key={bottomIndex}
            image={bottoms[bottomIndex]} 
            handleSwipe={handleSwipeBottom} 
            isLocked={isLocked.bottom}
            isAllLocked={isLocked.all}
            handleSwipeAll={handleSwipeAll}
            itemLength={bottoms.length} 
          />
        </div>
        <div className="swipeable-container bottom">
      <SwipeableImage 
        key={shoesIndex}
        image={shoes[shoesIndex]} 
        handleSwipe={handleSwipeShoes} 
        isLocked={isLocked.shoes}
        isAllLocked={isLocked.all}
        handleSwipeAll={handleSwipeAll}
        itemLength={shoes.length} 
      />
      </div>
      </div>
      <br></br>
      <button onClick={toggleLockBottom} disabled={isLocked.all}>
        {isLocked.bottom ? 'Unlock Bottom' : 'Lock Bottom'}
      </button>
      <br></br>
      <button onClick={toggleLockShoes} disabled={isLocked.all}>
        {isLocked.shoes ? 'Unlock Shoes' : 'Lock Shoes'}
      </button>
      <div>
        <button onClick={saveOutfit}>Save Outfit</button>
      </div>
    </div> 
    </div>
  ); 
}

export default Outfit;
