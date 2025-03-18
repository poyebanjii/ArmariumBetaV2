import React, { useState, useEffect } from 'react';
import { db, auth, analytics } from '../backend/firebaseConfig';
import { logEvent } from 'firebase/analytics';
import { getDoc, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import Navbar from '../Navbar';

const EditClothing = () => {
    const { clothingId } = useParams();
    const { type } = useParams();
    const [image, setImage] = useState('');
    const [tags, setTags] = useState([]);
    const [newTags, setNewTags] = useState(''); 
    const [title, setTitle] = useState('');
    const [newTitle, setNewTitle] = useState(''); 
    const [newType, setNewType] = useState(type);

    useEffect(() => {
        const user = auth.currentUser;
        const fetchData = async () => {
            if (type == 'top') {
                const clothingDoc = doc(db, `Users/${user.uid}/ItemsCollection/top/items`, clothingId);
                const clothingData = await getDoc(clothingDoc);
    
                if (clothingData.exists()) {
                    const data = clothingData.data();
                    console.log(clothingData.data());
                    setImage(data.url);
                    setTags(data.tags);
                    setNewTags(data.tags.join(', '));
                    setTitle(data.title);
                    setNewTitle(data.title);
                }
                else {
                    console.log("DNF");
                }
            }
            else if (type == 'bottom') {
                const clothingDoc = doc(db, `Users/${user.uid}/ItemsCollection/bottom/items`, clothingId);
                const clothingData = await getDoc(clothingDoc);
    
                if (clothingData.exists()) {
                    const data = clothingData.data();
                    console.log(clothingData.data());
                    setImage(data.url);
                    setTags(data.tags);
                    setNewTags(data.tags.join(', '));
                    setTitle(data.title);
                    setNewTitle(data.title);
                }
                else {
                    console.log("DNF");
                }
            }
            else if (type == 'shoes') {
                const clothingDoc = doc(db, `Users/${user.uid}/ItemsCollection/shoes/items`, clothingId);
                const clothingData = await getDoc(clothingDoc);
    
                if (clothingData.exists()) {
                    const data = clothingData.data();
                    console.log(clothingData.data());
                    setImage(data.url);
                    setTags(data.tags);
                    setNewTags(data.tags.join(', '));
                    setTitle(data.title);
                    setNewTitle(data.title);
                }
                else {
                    console.log("DNF");
                }
            }
            else if (type == 'toplayer') {
                const clothingDoc = doc(db, `Users/${user.uid}/ItemsCollection/toplayer/items`, clothingId);
                const clothingData = await getDoc(clothingDoc);
    
                if (clothingData.exists()) {
                    const data = clothingData.data();
                    console.log(clothingData.data());
                    setImage(data.url);
                    setTags(data.tags);
                    setNewTags(data.tags.join(', '));
                    setTitle(data.title);
                    setNewTitle(data.title);
                }
                else {
                    console.log("DNF");
                }
            }
        };
        fetchData();
    }, [clothingId])

    const handleTagChange = (e) => {
        setNewTags(e.target.value); 
    };

    // Perhaps they can be merged
    const handleUpdateTags = async () => {
        const user = auth.currentUser; // Ensure `user` is defined
        if (!user) {
            console.error("User is not authenticated");
            return;
        }

        
        let clothingDoc;
        if (type === 'top') {
            clothingDoc = doc(db, `Users/${user.uid}/ItemsCollection/top/items`, clothingId);
        } else if (type === 'bottom') {
            clothingDoc = doc(db, `Users/${user.uid}/ItemsCollection/bottom/items`, clothingId);
        } else if (type === 'shoes') {
            clothingDoc = doc(db, `Users/${user.uid}/ItemsCollection/shoes/items`, clothingId);
        } else {
            console.error("Invalid type provided");
            return;
        }
        console.log("clothiing doc:", clothingDoc)
        const tagsArray = newTags.split(',').map(tag => tag.trim());
        const uniqueTags = Array.from(new Set(tagsArray));
        await updateDoc(clothingDoc, { tags: uniqueTags });

        setTags(uniqueTags);
        setNewTags(uniqueTags.join(', '));

        console.log('Logging event: tags_updated', { clothing_id: clothingId, type, new_tags: uniqueTags });
        logEvent(analytics, 'tags_updated', {
            clothing_id: clothingId,
            type: type,
            new_tags: uniqueTags,
        });
    }

    const handleTitleChange = (e) => {
        setNewTitle(e.target.value); 
    };

    const handleUpdateTitle = async () => {
        const user = auth.currentUser; // Ensure `user` is defined
        if (!user) {
            console.error("User is not authenticated");
            return;
        }

        
        if (newTitle.trim() === '') {
            alert("Title cannot be empty")
            return; 
        }

        let clothingDoc;
        if (type === 'top') {
            clothingDoc = doc(db, `Users/${user.uid}/ItemsCollection/top/items`, clothingId);
        } else if (type === 'bottom') {
            clothingDoc = doc(db, `Users/${user.uid}/ItemsCollection/bottom/items`, clothingId);
        } else if (type === 'shoes') {
            clothingDoc = doc(db, `Users/${user.uid}/ItemsCollection/shoes/items`, clothingId);
        } else {
            console.error("Invalid type provided");
            return;
        }

        await updateDoc(clothingDoc, { title: newTitle });

        setTitle(newTitle);
        setNewTitle(newTitle);

        logEvent(analytics, 'title_updated', {
            clothing_id: clothingId,
            type: type,
            new_title: newTitle,
        });
    }

    const handleTypeChange = async (e) => {
        setNewType(e.target.value);
    };

    const handleUpdateType = async () => {
        const user = auth.currentUser;
        if (!user) {
            console.error('User is not authenticated');
            return;
        }

        if (newType === type) {
            alert('Selected type is the same as the current type');
            return;
        }

        const currentDoc = doc(db, `Users/${user.uid}/ItemsCollection/${type}/items`, clothingId);
        const newDoc = doc(db, `Users/${user.uid}/ItemsCollection/${newType}/items`, clothingId);

        const clothingData = await getDoc(currentDoc);
        if (!clothingData.exists()) {
            console.error('Clothing item not found in the current collection');
            return;
        }

        // Move document to the new collection
        await setDoc(newDoc, clothingData.data());
        await deleteDoc(currentDoc);

        setNewType(newType);
        logEvent(analytics, 'type_updated', { clothing_id: clothingId, old_type: type, new_type: newType });
        alert('Clothing type updated successfully');
    };

    return (
        <div>
            <Navbar />
            <h1>Edit Clothing</h1>
            <div>
                {image && <img src={image} alt="Clothing" style={{ width: '150px', height: 'auto',  }} />}
                {tags.length > 0 && (
                    <div>
                        <h3>Current Tags:</h3>
                        <ul>
                            {tags.map((tag, index) => (
                                <li key={index}>{tag}</li>
                            ))}
                        </ul>
                    </div>
                )}
                <div>
                    <h3>Update Tags</h3>
                    <input 
                        type="text" 
                        placeholder="Enter new tags separated by commas" 
                        value={newTags} 
                        onChange={handleTagChange}
                    />
                    <button onClick={handleUpdateTags}>Update Tags</button>
                </div>
                <div>
                    <h3>Update Title</h3>
                    <input 
                        type="text" 
                        placeholder="Enter a new title" 
                        value={newTitle} 
                        onChange={handleTitleChange}
                    />
                    <button onClick={handleUpdateTitle}>Update Title</button>
                </div>
                <div>
                    <h3>Change Clothing Type</h3>
                    <select value={newType} onChange={handleTypeChange}>
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                        <option value="shoes">Shoes</option>
                        <option value="toplayer">Top Layer</option>
                    </select>
                    <button onClick={handleUpdateType}>Update Type</button>
                </div>
            </div>
        </div>
    );
};

export default EditClothing;
