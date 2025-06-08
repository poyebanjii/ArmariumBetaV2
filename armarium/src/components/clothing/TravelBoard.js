import React, { useState, useEffect } from 'react'; 
import Navbar from '../Navbar';
import CreateTravelBoard from './CreateTravelBoard';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig';

function TravelBoard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [travelBoards, setTravelBoards] = useState([]);
  const [user, setUser] = useState(null);

  const auth = getAuth();

  const handleShowModal = () => {
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    document.body.classList.remove('modal-open');
    fetchTravelBoards(); // refresh after closing modal
  };

  const fetchTravelBoards = async () => {
    if (!user) return;
    try {
      const snapshot = await getDocs(collection(db, `Users/${user.uid}/TravelBoards`));
      const boards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTravelBoards(boards);
    } catch (err) {
      console.error("Error fetching travel boards:", err);
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

  return (
    <div>
      <Navbar />

      <div className="center" style={{ marginTop: '20px' }}>
        <button
          className="outfit-button"
          onClick={handleShowModal}
        >
          Create Travel Board
        </button>
      </div>

      <h2 style={{ textAlign: 'center', marginTop: '30px' }}>Your Travel Boards</h2>

      <div className="travel-board-list center" style={{ marginTop: '20px' }}>
        {travelBoards.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No travel boards yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {travelBoards.map(board => (
              <li key={board.id} style={{
                border: '1px solid #ccc',
                padding: '15px',
                marginBottom: '10px',
                borderRadius: '8px',
                maxWidth: '600px'
              }}>
                <h3>{board.title || 'Untitled Board'}</h3>
                <p><strong>Dates:</strong> {board.startDate} → {board.endDate}</p>
                <p><strong>Days Planned:</strong> {Object.keys(board.outfitsPerDay || {}).length}</p>
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
    </div>
  );
}

export default TravelBoard;
