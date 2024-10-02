import React, { useState, useEffect } from 'react';
import { db, auth } from '../backend/firebaseConfig';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
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
        };
        fetchData();
    }, [clothingId])

    const handleTagChange = (e) => {
        setNewTags(e.target.value); 
    };

    // Perhaps they can be merged
    const handleUpdateTags = async () => {
        let clothingDoc = doc(db, 'ItemsCollection/top/items', clothingId); // as default so it won't yell at me.
        if (type == 'top') {
            clothingDoc = doc(db, 'ItemsCollection/top/items', clothingId);
        }
        else if (type == 'bottom') {
            clothingDoc = doc(db, 'ItemsCollection/bottom/items', clothingId);
        }
        else if (type == 'shoes') {
            clothingDoc = doc(db, 'ItemsCollection/shoes/items', clothingId);
        }
        const tagsArray = newTags.split(',').map(tag => tag.trim());
        const uniqueTags = Array.from(new Set(tagsArray));
        await updateDoc(clothingDoc, { tags: uniqueTags });

        setTags(uniqueTags);
        setNewTags(uniqueTags.join(', '));
    }

    const handleTitleChange = (e) => {
        setNewTitle(e.target.value); 
    };

    const handleUpdateTitle = async () => {
        if (newTitle.trim() === '') {
            alert("Title cannot be empty")
            return; 
        }

        let clothingDoc = doc(db, 'ItemsCollection/top/items', clothingId); // as default so it won't yell at me.
        if (type == 'top') {
            clothingDoc = doc(db, 'ItemsCollection/top/items', clothingId);
        }
        else if (type == 'bottom') {
            clothingDoc = doc(db, 'ItemsCollection/bottom/items', clothingId);
        }
        else if (type == 'shoes') {
            clothingDoc = doc(db, 'ItemsCollection/shoes/items', clothingId);
        }

        await updateDoc(clothingDoc, { title: newTitle });

        setTitle(newTitle);
        setNewTitle(newTitle);
    }

    return (
        <div>
            <Navbar />
            <h1>Edit Clothing</h1>
            <div>
                {image && <img src={image} alt="Clothing" style={{ width: '150px', height: 'auto' }} />}
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
            </div>
        </div>
    );
};

export default EditClothing;
