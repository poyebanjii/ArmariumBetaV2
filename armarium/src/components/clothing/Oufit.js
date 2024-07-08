import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion"; 
import '../styles/Outfits.css';

/**
 * Function to import all images from a directory
 * @param {String} r 
 * @returns {Array} list of imported images
 */
function importAll(r) {
  let images = {};
  r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
  return Object.values(images);
}

const tops = importAll(require.context('../photos/tops', false, /\.(png|jpe?g|svg)$/));
const bottoms = importAll(require.context('../photos/bottoms', false, /\.(png|jpe?g|svg)$/));
console.log('Tops:', tops);
console.log('Bottoms:', bottoms);

/**
 * The swipeable component for tops and bottoms
 * @param {Image to display} image 
 * @param {Function to handle swipes} handleSwipe
 * @param {Boolean for locking} isLocked
 * @returns the swipeable image.
 */
const SwipeableImage = ({ image, handleSwipe, isLocked  }) => { 

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
        drag={isLocked ? false : "x"}
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
                  handleSwipe(direction);
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
  const [isLocked, setIsLocked] = useState({ top: false, bottom: false });

  const handleSwipeTop = (direction) => {
    if (!isLocked.top) {
      if (direction === "left") {
        setTopIndex((prevIndex) => (prevIndex + 1) % tops.length);
      } else if (direction === "right") {
        setTopIndex((prevIndex) => (prevIndex - 1 + tops.length) % tops.length);
      }
      console.log('New Tops:', topIndex);
    }
  };

  const handleSwipeBottom = (direction) => {
    if (!isLocked.bottom) {
      if (direction === "left") {
        setBottomIndex((prevIndex) => (prevIndex + 1) % bottoms.length);
      } else if (direction === "right") {
        setBottomIndex((prevIndex) => (prevIndex - 1 + bottoms.length) % bottoms.length);
      }
      console.log('New Bottoms:', bottomIndex);
    }
  };

  const toggleLockTop = () => {
    setIsLocked(prevState => ({ ...prevState, top: !prevState.top }));
  };

  const toggleLockBottom = () => {
    setIsLocked(prevState => ({ ...prevState, bottom: !prevState.bottom }));
  };

  return ( 
    <div className='App'> 
      <h1>Outfits</h1>
      <button onClick={toggleLockTop}>
            {isLocked.top ? 'Unlock Top' : 'Lock Top'}
          </button>
      <div className="outfit-card">
        <div className="swipeable-container top">
          <SwipeableImage 
            key={topIndex}
            image={tops[topIndex]} 
            handleSwipe={handleSwipeTop} 
            isLocked={isLocked.top}
          />
        </div>
        <div className="swipeable-container bottom">
          <SwipeableImage 
            key={bottomIndex}
            image={bottoms[bottomIndex]} 
            handleSwipe={handleSwipeBottom} 
            isLocked={isLocked.bottom}
          />
        </div>
      </div>
      <br>
      </br>
      <button onClick={toggleLockBottom}>
            {isLocked.bottom ? 'Unlock Bottom' : 'Lock Bottom'}
      </button>
      <br>
      </br>
      <button>Save Outfit</button>
    </div> 
  ); 
}

export default Outfit;
