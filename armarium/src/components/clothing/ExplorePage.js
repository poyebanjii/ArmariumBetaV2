import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { doc, setDoc, deleteDoc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig'; 
import StarRating from '../utils/StarRating';
import Navbar from '../Navbar';
import '../styles/ExplorePage.css';

function ExplorePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { styleboard } = location.state || {};
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [rating, setRating] = useState(0);
  const [avgRating, setAvgRating] = useState(null);
  const [ratingCount, setRatingCount] = useState(0);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchRatings = async () => {
      if (!styleboard) return;
      try {
        const ratingsRef = collection(db, `Styleboards/${styleboard.id}/Ratings`);
        const snapshot = await getDocs(ratingsRef);

        let total = 0;
        let count = 0;
        snapshot.forEach(doc => {
          total += doc.data().rating;
          count++;
          if (doc.id === user?.uid) {
            setRating(doc.data().rating); 
          }
        });

        setAvgRating(count > 0 ? (total / count).toFixed(1) : null);
        setRatingCount(count);
      } catch (err) {
        console.error("Error fetching ratings:", err);
      }
    };

    fetchRatings();
  }, [styleboard, user]);

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!styleboard || !user) return;

      try {
        const bookmarkDocRef = doc(db, `Users/${user.uid}/InspoFolder`, styleboard.id);
        const bookmarkDoc = await getDoc(bookmarkDocRef);

        if (bookmarkDoc.exists()) {
          setIsBookmarked(true);
        } else {
          setIsBookmarked(false);
        }
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    };

    checkBookmarkStatus();
  }, [styleboard, user]);

  const handleBookmarkToggle = async () => {
    if (!styleboard || !user) {
      alert('You must be logged in to bookmark a styleboard.');
      return;
    }
  
    try {
      const bookmarkDocRef = doc(db, `Users/${user.uid}/InspoFolder/${styleboard.id}`);
  
      if (isBookmarked) {
        // Unbookmark the styleboard
        await deleteDoc(bookmarkDocRef);
        setIsBookmarked(false);
        alert('Styleboard removed from InspoFolder.');
      } else {
        // Bookmark the styleboard and save its data
        await setDoc(bookmarkDocRef, {
          id: styleboard.id,
          name: styleboard.styleboardName,
          outfits: styleboard.outfits, 
          createdAt: new Date().toISOString(), 
        });
        setIsBookmarked(true);
        alert('Styleboard added to InspoFolder.');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert('Failed to update bookmark status. Please try again.');
    }
  };

  const handleRate = async (value) => {
    if (!user) {
      alert("You must be logged in to rate.");
      return;
    }

    if (styleboard.ownerId === user.uid) {
      alert("You cannot rate your own styleboard.");
      return;
    }

    try {
      const ratingRef = doc(db, `Styleboards/${styleboard.id}/Ratings/${user.uid}`);
      await setDoc(ratingRef, {
        rating: value,
        ratedAt: new Date().toISOString(),
      });

      setRating(value);

      // Refresh avgerage.
      const ratingsRef = collection(db, `Styleboards/${styleboard.id}/Ratings`);
      const snapshot = await getDocs(ratingsRef);
      let total = 0, count = 0;
      snapshot.forEach(doc => {
        total += doc.data().rating;
        count++;
      });
      setAvgRating((total / count).toFixed(1));
      setRatingCount(count);

      const sbRef = doc(db, `Styleboards/${styleboard.id}`);
      await updateDoc(sbRef, {
        averageRating: total / count,
        ratingCount: count,
      });

    } catch (err) {
      console.error("Error saving rating:", err);
    }
  };

  if (!styleboard) {
    return <p>No styleboard data found.</p>;
  }

  console.log('Styleboard data in ExplorePage:', styleboard); 

  return (
    <div>
      <Navbar />

      <div className="explore-detail-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back to Explore
        </button>
        <h1>{styleboard.styleboardName}</h1>
      </div>
      
    <div className="rating-section">
      <h3>Rate this Styleboard</h3>
      <div className="rating-stars">
        <StarRating key={rating} rating={rating} onRate={handleRate} />
        <p className="avg-rating-text">
          {avgRating ? `Average Rating: ${avgRating} ⭐ (${ratingCount} ratings)` : "No ratings yet"}
        </p>
      </div>
    </div>
      <div className="bookmark-container">
        <img
          src={isBookmarked ? "bookmark.png" : "unbookmark.png"} 
          alt={isBookmarked ? "Bookmark" : "Unbookmark"}
          onClick={handleBookmarkToggle} 
          style={{ width: "30px", height: "30px", cursor: "pointer" }}
        />
      </div>
      <ul className="outfits-list1">
        {styleboard.outfits.map((outfit, index) => (
          <li key={outfit.id || index} className="outfit-item1">
            <h2>{outfit.outfitName || 'Unnamed Outfit'}</h2>
            <div className="image-container1">
              {outfit.topImageUrl && <img src={outfit.topImageUrl} alt="Top" />}
              {outfit.bottomImageUrl && <img src={outfit.bottomImageUrl} alt="Bottom" />}
              {outfit.shoesImageUrl && <img src={outfit.shoesImageUrl} alt="Shoes" />}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ExplorePage;