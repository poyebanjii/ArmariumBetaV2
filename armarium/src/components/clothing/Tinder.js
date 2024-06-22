import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from "framer"; 
import { useNavigate, Link } from 'react-router-dom';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import '../styles/Tinder.css';

/**
 * The card component
 * @param {Image of the card} image 
 * @param {Color of the card} image 
 * @returns the card.
 */
const Card = ({ image, color }) => { 

  /**
  * Sample styling.
  */
  const style = { 
    backgroundImage: `url(${image})`,
    backgroundRepeat: "no-repeat", 
    backgroundSize: "contain", 
    backgroundPosition: "center",
    backgroundColor: color, 
    boxShadow: "5px 10px 18px #888888", 
    borderRadius: 10, 
    height: 550,
    
  }; 

  /**
  * This moves the card for when the user wants to drag. 
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
   * State to track the swipe direction. 
   */
  const [swipeDirection, setSwipeDirection] = useState(null);

  /**
  * State to track whether the card is swiped or not.
  */
  const [isSwiped, setIsSwiped] = useState(false);

  /**
   * Framer animation hook.
   */
  const animControls = useAnimation();
  
  return ( 
    !isSwiped && (
      <div className="Card"> 
          <h2>Swipe left or right</h2>
          <motion.div
              drag="x"
              dragConstraints={{ left: -1000, right: 1000 }} 
              style={{
                ...style,
                x: motionValue,
                rotate: rotateValue,
                opacity: opacityValue
              }}
              onDragEnd={(event, info) => { 
                  if (Math.abs(info.point.x) <= 150) { 
                      animControls.start({ x: 0, rotate: 0, opacity: 1 });
                      setSwipeDirection(null); 
                  } 
                  else { 
                      const direction = info.offset.x < 0 ? "left" : "right";
                      setSwipeDirection(direction);
                      animControls.start({ x: direction === "left" ? -200 : 200, rotate: direction === "left" ? -10 : 10, opacity: 0 }); 
                      setIsSwiped(true); 

                      if (direction == "left") {
                        alert("Left Swipe!");
                      }
                      else if (direction == "right") {
                        alert("Right Swipe!");
                      }
                  } 
              }} 
          /> 
      </div> 
    )
  );
}


/**
 * The tinder style page for having users swipe left or right depending if they like the clothing item 
 * recommendation or not.
 * @returns Tinder page.
 */
function TinderPage() {
  const cards = [ 
    { 
        image: require('../photos/Clothing1.jpg'), 
        color: '#55ccff'
    }, 
    { 
        image: require('../photos/Clothing2.jpg'), 
        color: '#e8e8e8'
    }, 
    { 
        image: require('../photos/Clothing3.jpg'), 
        color: '#0a043c'
    }, 
    { 
        image: require('../photos/Clothing4.jpg'), 
        color: 'black'
    } 
];

  return ( 
    <div className='App'> 
      <h1>Welcome user.</h1>

        {/* Traversing through cards array using map function 
  and populating card with different image and color */} 

        {cards.map((card) => ( 
            <Card image={card.image} color={card.color} /> 
        ))} 
    </div> 
); 
}


export default TinderPage;