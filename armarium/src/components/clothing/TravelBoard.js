import React, { useState, useEffect } from 'react'; 
import Navbar from '../Navbar';
import CreateTravelBoard from './CreateTravelBoard';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import Loader from '../Loader';
import Joyride from 'react-joyride';

function TravelBoard() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [travelBoards, setTravelBoards] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTravelboards, setSelectedTravelboards] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const auth = getAuth();
  const DELAY = 750;
  const [runTour, setRunTour] = useState(false);
  const [steps, setSteps] = useState([]);
  const location = useLocation();
  
  const finishTour = async () => {
    localStorage.setItem('wardrobeTutorialCompleted', 'true'); 
    setRunTour(false);
  };

  const handleShowModal = () => {
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    document.body.classList.remove('modal-open');
    fetchTravelBoards(); // refresh after closing modal
  };

  const handleTravelClick = (travelBoard) => {
    navigate(`/travelBoardPage/${travelBoard.id}`, { state: { travelBoard } });
  };

  const handleCheckboxClick = (event, boardId) => {
    event.stopPropagation();
    setSelectedTravelboards((prev) =>
      prev.includes(boardId)
        ? prev.filter((id) => id !== boardId)
        : [...prev, boardId]
    );
  };

  const handleDelete = async () => {
    const user = auth.currentUser;
    if (!selectedTravelboards.length) {
      alert("No travel board has been selected.");
      return;
    }

    try {
        await new Promise((resolve) => setTimeout(resolve, DELAY));
    
        for (const travelBoard of selectedTravelboards) {
          const travelBoardDocRef = doc(db, `Users/${user.uid}/TravelBoards`, travelBoard);
          await deleteDoc(travelBoardDocRef);
          console.log("Travel Board deleted successfully:", travelBoard);
        }
    
        setSelectedTravelboards([]);
        await fetchTravelBoards(); 
        setShowDeleteModal(false);
      } catch (error) {
        console.error("Error deleting travel board:", error);
        alert("Failed to delete travel board. Please try again.");
      }
  };

  const handleSearchChange = (e) => {
      const inputValue = e.target.value.toLowerCase();
      setSearchInput(inputValue);
  };

  const filteredTravelBoards = travelBoards.filter(travelBoard => {
    return travelBoard.title && travelBoard.title.toLowerCase().includes(searchInput.toLowerCase());
  });

  const fetchTravelBoards = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, `Users/${user.uid}/TravelBoards`));
      const boards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTravelBoards(boards);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching travel boards:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchTravelBoards();
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchTravelBoards();
    }
  }, [user]);

  useEffect(() => {
    if (location.state?.startTutorial) {
      setSteps([
        {
          target: '.center',
          content: 'Here you can create travel boards. If you need to plan for a trip and figure out what you have to wear this is where you can do it',
          placement: 'center',
          disableBeacon: true,
        },
        {
          target: '.search-input',
          content: 'Quickly find specific outfits by searching for their names.',
        },
        {
          target: '.outfit-button:nth-of-type(1)',
          content: 'This is where all your outfits are displayed. Click on any outfit to view details.',
        },
        {
          target: '.outfit-button:nth-of-type(2)', 
          content: 'Select travel boards by clicking them, then use this button to delete them.',
        },

      ]);
      setRunTour(true);
    }
  }, [location]);

  return (
    <div>
      <Loader loading={loading} />
      <Navbar />

      <div className="center" style={{ marginTop: '20px', gap: '10px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="outfit-button" onClick={handleShowModal}>
          Create Travel Board
        </button>
        <button
          className="outfit-button"
          style={{ backgroundColor: selectedTravelboards.length ? '#e63939' : '#ccc' }}
          onClick={handleDelete}
          disabled={selectedTravelboards.length === 0}
        >
          Delete Selected
        </button>
      </div>

      <h2 style={{ textAlign: 'center', marginTop: '30px' }}>Your Travel Boards</h2>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <input
        type="text"
        placeholder="Search travel boards..."
        value={searchInput}
        onChange={handleSearchChange}
        style={{
          padding: '10px',
          width: '300px',
          borderRadius: '5px',
          border: '1px solid #ccc'
        }}
        className='search-input'
      />
    </div>

      <div className="travel-board-list center" style={{ marginTop: '20px' }}>
        {travelBoards.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No travel boards yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {filteredTravelBoards.map(board => (
              <li
                key={board.id}
                onClick={() => handleTravelClick(board)}
                style={{
                  border: '1px solid #ccc',
                  padding: '15px',
                  marginBottom: '10px',
                  borderRadius: '8px',
                  maxWidth: '600px',
                  cursor: 'pointer',
                  position: 'relative',
                  backgroundColor: selectedTravelboards.includes(board.id) ? '#f0f8ff' : 'white'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedTravelboards.includes(board.id)}
                  onClick={(e) => handleCheckboxClick(e, board.id)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    transform: 'scale(1.2)',
                    cursor: 'pointer'
                  }}
                />
                <div style={{ marginLeft: '30px' }}>
                  <h3>{board.title || 'Untitled Board'}</h3>
                  <p><strong>Dates:</strong> {board.startDate} → {board.endDate}</p>
                  <p><strong>Days Planned:</strong> {Object.keys(board.outfitsPerDay || {}).length}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <CreateTravelBoard />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button className="modal-close" onClick={handleCloseModal}>Close</button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}

export default TravelBoard;