import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion, collection, getDocs, setDoc, query, where } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig';
import Navbar from '../Navbar';
import '../styles/FriendRequests.css';
import { sendFriendRequest } from '../utils/friends'; // Import the sendFriendRequest function

function FriendRequests({ currentUserId }) {
    const [friendRequests, setFriendRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    // seach-related state
    const [searchUsername, setSearchUsername] = useState('');
    const [message, setMessage] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [debounceTimeout, setDebounceTimeout] = useState(null);

    useEffect(() => {
        if (!currentUserId) {
            console.error('currentUserId is undefined');
            setLoading(false);
            return;
        }
    
        const fetchFriendRequests = async () => {
            try {
                const userRef = doc(db, 'users', currentUserId);
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

        const fetchFriends = async () => {
            try {
                const friendsRef = collection(db, 'Users', currentUserId, 'friends');
                const querySnapshot = await getDocs(friendsRef);

                const friendsList = [];
                querySnapshot.forEach((doc) => {
                    friendsList.push({ id: doc.id, ...doc.data() });
                });

                setFriends(friendsList);
            } catch (error) {
                console.error('Error fetching friends:', error);
            }
        };

        fetchFriendRequests();
        fetchFriends();
    }, [currentUserId]);

    const handleAccept = async (requesterId) => {
        const currentUserRef = doc(db, 'Users', currentUserId);
        const currentUserFriendDoc = doc(db, 'Users', currentUserId, 'friends', requesterId);
        const requesterFriendDoc = doc(db, 'Users', requesterId, 'friends', currentUserId);

        try {
            // Add each user to the other's friends list
            await setDoc(currentUserFriendDoc, {
                timestamp: new Date(),
            });

            await setDoc(requesterFriendDoc, {
                timestamp: new Date(),
            });

            // Remove friend request from array
            await updateDoc(currentUserRef, {
                friendRequests: arrayRemove(requesterId),
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

    const handleSendRequest = async () => {
        const result = await sendFriendRequest(currentUserId, searchUsername.trim());
        setMessage(result);
        setSearchUsername(''); // Clear the input field after sending the request
        setSearchUsername(''); // Clear the input field after sending the request
        setSuggestions([]); // Clear suggestions after sending the request
    };

    useEffect(() => {
        if (!searchUsername) {
            setSuggestions([]);
            return;
        }

        if (debounceTimeout) clearTimeout(debounceTimeout);

        const timeout = setTimeout(async () => {
            const startAt = searchUsername.toLowerCase();
            const endAt = startAt + '\uf8ff'; // Use a high Unicode character to match all possible endings

            try {
                const q = query(
                    collection(db, 'Users'),
                    where('username', '>=', startAt),
                    where('username', '<=', endAt)
                );
                const querySnapshot = await getDocs(q);

                const usernames = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.username && data.username !== currentUserId) {
                        usernames.push(data.username);
                    }
                });

                setSuggestions(usernames);
            } catch (error) {
                console.error('Error fetching usernames:', error);
                setSuggestions([]);
            }
        }, 300); // 300ms debounce

        setDebounceTimeout(timeout);
    }, [searchUsername]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Navbar />
            <div className="friend-requests-container">
                {/* Friend Search UI */}
                <div className="user-search" style={{ position: 'relative' }}>
                    <h2>Find a Friend</h2>
                    <input
                        type="text"
                        placeholder="Enter username"
                        value={searchUsername}
                        onChange={(e) => setSearchUsername(e.target.value)}
                    />
                    {suggestions.length > 0 && (
                        <ul className="suggestions-dropdown">
                        {suggestions.map((username) => (
                            <li
                            key={username}
                            onClick={() => {
                                setSearchUsername(username);
                                setSuggestions([]);
                            }}
                            >
                            {username}
                            </li>
                        ))}
                        </ul>
                    )}
                    <button onClick={handleSendRequest}>Send Friend Request</button>
                    {message && <p>{message}</p>}
                </div>
                {/* Friend Requests UI */}
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