import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig';
import Navbar from '../Navbar';
import '../styles/FriendRequests.css';

function FriendRequests({ currentUserId }) {
    const [friendRequests, setFriendRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFriendRequests = async () => {
            if (!currentUserId) {
                console.error('currentUserId is undefined');
                setLoading(false);
                return;
            }

            try {
                const userRef = doc(db, 'users', currentUserId); // Ensure 'users' matches your Firestore collection name
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    setFriendRequests(userDoc.data().friendRequests || []);
                }
            } catch (error) {
                console.error('Error fetching friend requests:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFriendRequests();
    }, [currentUserId]);

    const handleAccept = async (requesterId) => {
        const currentUserRef = doc(db, 'Users', currentUserId);
        const requesterUserRef = doc(db, 'Users', requesterId);

        try {
            // Add each user to the other's friends list
            await updateDoc(currentUserRef, {
                friends: arrayUnion(requesterId),
                friendRequests: arrayRemove(requesterId),
            });
            await updateDoc(requesterUserRef, { // Use the correct variable name here
                friends: arrayUnion(currentUserId),
            });
    
            setFriendRequests((prev) => prev.filter((id) => id !== requesterId));
        } catch (error) {
            console.error('Error accepting friend request:', error);
        }
    };

    const handleReject = async (requesterId) => {
        const currentUserRef = doc(db, 'Users', currentUserId);

        try {
            // Remove the requester from the friendRequests array
            await updateDoc(currentUserRef, {
                friendRequests: arrayRemove(requesterId),
            });

            setFriendRequests((prev) => prev.filter((id) => id !== requesterId));
        } catch (error) {
            console.error('Error rejecting friend request:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Navbar />
            <div className="friend-requests-container">
                <h2>Friend Requests</h2>
                {friendRequests.length === 0 ? (
                    <p>No friend requests at the moment.</p>
                ) : (
                    friendRequests.map((requesterId) => (
                    <div key={requesterId} className="friend-request">
                        <p>{requesterId}</p>
                        <button onClick={() => handleAccept(requesterId)}>Accept</button>
                        <button onClick={() => handleReject(requesterId)}>Reject</button>
                    </div>
                    ))
                )}
            </div>
        </>
    );
}

export default FriendRequests;
// NOTE: This component is used to display the friend requests for a user. It fetches the friend requests 
// from the database and allows the user to accept or reject them. The component uses the useEffect hook 
// to fetch the friend requests when the component mounts and when the currentUserId changes. The handleAccept
//  and handleReject functions are used to update the database when a friend request is accepted or rejected.
//  The component also uses the useState hook to manage the state of the friend requests and loading status.