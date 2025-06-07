import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Navbar from '../Navbar';

function TravelBoard() {
    const auth = getAuth(); 


    const handleTravelBoardCreation = async () => {
        const user = auth.currentUser;
        if (!user) return;
    };
    
    return (
        <div>
            <Navbar />


            <button className="outfit-button" onClick={handleTravelBoardCreation} style={{ marginLeft: '10px' }}>
                Create Travel Board
            </button>

        </div>
    )
}

export default TravelBoard;