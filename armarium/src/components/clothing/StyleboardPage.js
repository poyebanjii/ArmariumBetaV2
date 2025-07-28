import React, { useEffect, useState } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../backend/firebaseConfig';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Navbar';
import OutfitsList from './OutfitsList';
import '../styles/MyOutfits.css';
import Loader from '../Loader';

function StyleboardPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [styleboard, setStyleboard] = useState(null);
  const [title, setTitle] = useState('');
  const [selectedOutfits, setSelectedOutfits] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchStyleboard = async () => {
    const user = auth.currentUser;
    if (!user || !id) return;

    const styleboardRef = doc(db, `Users/${user.uid}/Styleboards`, id);
    const docSnap = await getDoc(styleboardRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const outfits = await Promise.all(
        (data.outfits || []).map(async (ref) => {
          const snap = await getDoc(ref);
          return snap.exists() ? { id: snap.id, ...snap.data() } : null;
        })
      );
      setStyleboard({ id, ...data, outfits: outfits.filter(Boolean) });
      setTitle(data.name || '');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStyleboard();
  }, [id]);

  const handleDelete = async () => {
    const user = auth.currentUser;
    try {
      const styleboardDocRef = doc(db, `Users/${user.uid}/Styleboards`, styleboard.id);
      const styleboardDoc = await getDoc(styleboardDocRef);
      if (!styleboardDoc.exists()) return;

      const currentOutfits = styleboardDoc.data().outfits || [];
      const selectedOutfitRefs = selectedOutfits.map((outfit) => doc(db, `Users/${user.uid}/Outfits`, outfit.id));

      const updatedOutfits = currentOutfits.filter(
        (outfitRef) => !selectedOutfitRefs.some((selRef) => selRef.path === outfitRef.path)
      );

      await updateDoc(styleboardDocRef, { outfits: updatedOutfits });

      const exploreDocRef = doc(db, 'ExploreStyleboards', styleboard.id);
      const exploreDoc = await getDoc(exploreDocRef);
      if (exploreDoc.exists()) {
        const currentExploreOutfits = exploreDoc.data().outfits || [];
        const updatedExploreOutfits = currentExploreOutfits.filter(
          (outfit) => !selectedOutfits.some((sel) => sel.id === outfit.id)
        );
        await updateDoc(exploreDocRef, { outfits: updatedExploreOutfits });
      }

      setSelectedOutfits([]);
      setShowDeleteModal(false);
      fetchStyleboard();
    } catch (error) {
      console.error("Error deleting outfit:", error);
    }
  };

  const handleTitleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userStyleboardRef = doc(db, `Users/${user.uid}/Styleboards`, styleboard.id);
      await updateDoc(userStyleboardRef, { name: title });

      const exploreStyleboardRef = doc(db, 'ExploreStyleboards', styleboard.id);
      const exploreDoc = await getDoc(exploreStyleboardRef);
      if (exploreDoc.exists()) {
        await updateDoc(exploreStyleboardRef, { styleboardName: title });
      }

      alert('Styleboard title updated!');
    } catch (err) {
      console.error('Error updating title:', err);
      alert('Failed to update title.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!styleboard) return <Loader loading={loading} />;

  const userId = auth.currentUser?.uid;

  return (
    <div>
      <Navbar />
      <button onClick={() => navigate(-1)} style={{ marginBottom: '20px' }} className="back-button">← Back to Styleboards</button>

      <div className="center">
        <button
          className="outfit-button"
          onClick={() => {
            if (selectedOutfits.length > 0) {
              setShowDeleteModal(true);
            } else {
              alert("No outfit has been selected.");
            }
          }}
        >
          Delete
        </button>
        <button
          className="outfit-button"
          onClick={() => navigate(`/wardrobeOutfits/${userId}`, {
            state: { mode: 'addToStyleboard', styleboard }
          })}
        >
          Add Outfits to Styleboard
        </button>
      </div>

      <div className="center">
        <input
          type="text"
          className="editable-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            fontSize: '2rem',
            textAlign: 'center',
            marginBottom: '10px',
            border: 'none',
            borderBottom: '2px solid gray',
            outline: 'none',
            width: '60%'
          }}
        />
        <button className="outfit-button" onClick={handleTitleSave}>Save Title</button>
      </div>

      <div className="center">
        <div className="outfit-outer">
          <div className="outfit-center">
            <OutfitsList
              outfits={styleboard.outfits}
              selectedOutfits={selectedOutfits}
              setSelectedOutfits={setSelectedOutfits}
            />
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <div className={`modal ${showDeleteModal ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Delete Outfit</h5>
              <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this outfit from this styleboard?</p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={handleDelete}>Delete</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StyleboardPage;
