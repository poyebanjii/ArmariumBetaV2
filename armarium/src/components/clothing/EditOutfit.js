import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../Navbar';
import '../styles/MyOutfits.css';
import '../styles/EditOutfit.css';

function EditOutfit() {
    const location = useLocation();
    const outfitName = location.state?.outfitName; // Get the outfit from the location state
    const [tabContent, setTabContent] = useState('Tops');

    return (
        <div>
            <Navbar />
            <div className="center">
                <h1 className="page-title">{ outfitName }</h1>
            </div>

            <div className="center">
                <div className="center edit-outfit-container">
                    <button className="left-button">Remove Layer</button>
                    <button className="right-button">Add layer</button>
                </div>
            </div>

            {/* Bottom Tab */}
            <div className="bottom-tab">
                <div className="tab-buttons">
                    <button onClick={() => setTabContent('Tops')} className="tab-button"
                        style={{
                            backgroundColor: tabContent === 'Tops' ? '#a52a2a' : 'white',
                            color: tabContent === 'Tops' ? 'white' : '#a52a2a'
                        }}>Tops</button>

                    <button onClick={() => setTabContent('Bottoms')} className="tab-button"
                        style={{
                            backgroundColor: tabContent === 'Bottoms' ? '#a52a2a' : 'white',
                            color: tabContent === 'Bottoms' ? 'white' : '#a52a2a'
                        }}>Bottoms</button>

                    <button onClick={() => setTabContent('Shoes')} className="tab-button"
                        style={{
                            backgroundColor: tabContent === 'Shoes' ? '#a52a2a' : 'white',
                            color: tabContent === 'Shoes' ? 'white' : '#a52a2a'
                        }}>Shoes</button>

                    <button onClick={() => setTabContent('Layers')} className="tab-button"
                        style={{
                            backgroundColor: tabContent === 'Layers' ? '#a52a2a' : 'white',
                            color: tabContent === 'Layers' ? 'white' : '#a52a2a'
                        }}>Layers</button>
                </div>
                <div className="tab-content">
                    <p>{ tabContent }</p>
                </div>
            </div>
        </div>
    );
}

export default EditOutfit;