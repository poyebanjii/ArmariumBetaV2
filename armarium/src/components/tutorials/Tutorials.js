import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Navbar from '../Navbar';
import '../styles/Tutorial.css';

function Tutorials() {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const tutorialPages = [
    {
      title: 'Wardrobe',
      description: 'Learn how to add, edit, and delete your clothing items.',
      route: '/wardrobe',
    },
    {
      title: 'Create Outfit',
      description: 'Walk through creating an outfit using your wardrobe.',
      route: '/outfits',
    },
    {
      title: 'Styleboards',
      description: 'Organize your outfits and plan looks using styleboards.',
      route: `/wardrobeStyleboards/${user.uid}`,
    },
    {
      title: 'Travel Boards',
      description: 'Plan your trip outfits day by day.',
      route: `/travelBoards/${user.uid}`,
    },
    {
      title: 'Daily Planner',
      description: 'Assign outfits to specific days using the calendar view.',
      route: `/planner/${user.uid}`,
    },
    {
      title: 'Explore InspoBoards',
      description: 'Find what other users are wearing to gain inspiration.',
      route: `/planner/${user.uid}`,
    }
  ];

  const handleStartTutorial = (route) => {
    navigate(route, { state: { startTutorial: true } });
  };

  return (
    <div>
      <Navbar />
      <div className="tutorials-container">
        <h1 className="tutorials-title">Tutorial Hub</h1>
        <p className="tutorials-subtitle">Choose a section to get a guided tour.</p>

        <div className="tutorials-grid">
          {tutorialPages.map((page, index) => (
            <div
              key={index}
              className="tutorial-card"
              onClick={() => handleStartTutorial(page.route)}
            >
              <h2>{page.title}</h2>
              <p>{page.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Tutorials;
