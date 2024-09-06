import React, { useState, useEffect } from 'react';
import { db } from '../backend/firebaseConfig';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import Navbar from '../Navbar';

const EditClothing = () => {
    const { clothingId } = useParams();
    const { type } = useParams();
    const [image, setImage] = useState('');
    const [tags, setTags] = useState([]);
    const [newTags, setNewTags] = useState(''); 

    useEffect(() => {
        const fetchData = async () => {
            if (type == 'top') {
                const clothingDoc = doc(db, 'ItemsCollection/top/items', clothingId);
                const clothingData = await getDoc(clothingDoc);
    
                if (clothingData.exists()) {
                    const data = clothingData.data();
                    console.log(clothingData.data());
                    setImage(data.url);
                    setTags(data.tags);
                    setNewTags(data.tags.join(', '));
                }
                else {
                    console.log("DNF");
                }
            }
            else if (type == 'bottom') {
                const clothingDoc = doc(db, 'ItemsCollection/bottom/items', clothingId);
                const clothingData = await getDoc(clothingDoc);
    
                if (clothingData.exists()) {
                    const data = clothingData.data();
                    console.log(clothingData.data());
                    setImage(data.url);
                    setTags(data.tags);
                    setNewTags(data.tags.join(', '));
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

    const handleUpdateTags = async () => {
        const tagsArray = newTags.split(',').map(tag => tag.trim());
        const uniqueTags = Array.from(new Set(tagsArray));
        const clothingDoc = doc(db, 'ItemsCollection/top/items', clothingId);
        await updateDoc(clothingDoc, { tags: uniqueTags });

        setTags(uniqueTags);
        setNewTags(uniqueTags.join(', '));
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
            </div>
        </div>
    );
};

export default EditClothing;
