import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion, collection, getDocs, setDoc, query, where } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig';
import Navbar from '../Navbar';
import { getAuth } from 'firebase/auth';
import '../styles/FriendRequests.css';
import { sendFriendRequest } from '../utils/friends'; // Import the sendFriendRequest function

function FriendRequests() {
    const auth = getAuth();
    const user = auth.currentUser;

    const currentUserId = user.uid; // Get the user's UID

    const [friendRequests, setFriendRequests] = useState([]);
    const [friendRequestDetails, setFriendRequestDetails] = useState([]);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    // seach-related state
    const [searchUsername, setSearchUsername] = useState('');
    const [message, setMessage] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [debounceTimeout, setDebounceTimeout] = useState(null);

    useEffect(() => {
        const fetchFriendRequests = async () => {
            try {
                if (!currentUserId) {
                    console.error('currentUserId is undefined');
                    return;
                }

                const userRef = doc(db, 'Users', currentUserId);
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    const data = userDoc.data();
                    console.log('Fetched friendRequests:', data.friendRequests); // Debugging
                    setFriendRequests(data.friendRequests || []);
                } else {
                    console.error('User document does not exist');
                }
            } catch (error) {
                console.error('Error fetching friend requests:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFriendRequests();
    }, [currentUserId]);

    useEffect(() => {
        const fetchUsernames = async () => {
            try {
                const details = await Promise.all(
                    friendRequests.map(async (userId) => {
                        const userRef = doc(db, 'Users', userId);
                        const userDoc = await getDoc(userRef);

                        if (userDoc.exists()) {
                            const data = userDoc.data();
                            return { id: userId, username: data.username || 'Unknown User' };
                        } else {
                            return { id: userId, username: 'Unknown User' };
                        }
                    })
                );

                setFriendRequestDetails(details);
            } catch (error) {
                console.error('Error fetching usernames:', error);
            }
        };

        if (friendRequests.length > 0) {
            fetchUsernames();
        }
    }, [friendRequests]);

    // const handleAccept = async (requesterId) => {
    //     const currentUserRef = doc(db, 'Users', currentUserId);
    //     const currentUserFriendDoc = doc(db, 'Users', currentUserId, 'friends', requesterId);
    //     const requesterFriendDoc = doc(db, 'Users', requesterId, 'friends', currentUserId);

    //     try {
    //         // Add each user to the other's friends list
    //         await setDoc(currentUserFriendDoc, {
    //             timestamp: new Date(),
    //         });

    //         await setDoc(requesterFriendDoc, {
    //             timestamp: new Date(),
    //         });

    //         // Remove friend request from array
    //         await updateDoc(currentUserRef, {
    //             friendRequests: arrayRemove(requesterId),
    //         });
    
    //         setFriendRequests((prev) => prev.filter((id) => id !== requesterId));
    //     } catch (error) {
    //         console.error('Error accepting friend request:', error);
    //     }
    // };

    const updateFriendRequestDetails = async (updatedFriendRequests) => {
        try {
            const details = await Promise.all(
                updatedFriendRequests.map(async (userId) => {
                    const userRef = doc(db, 'Users', userId);
                    const userDoc = await getDoc(userRef);
    
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        return { id: userId, username: data.username || 'Unknown User' };
                    } else {
                        return { id: userId, username: 'Unknown User' };
                    }
                })
            );
    
            setFriendRequestDetails(details);
        } catch (error) {
            console.error('Error updating friend request details:', error);
        }
    };

    const handleAccept = async (requesterId) => {
        console.log('Accepting friend request from:', requesterId); // Debugging
    
        const currentUserRef = doc(db, 'Users', currentUserId);
        const currentUserFriendDoc = doc(db, 'Users', currentUserId, 'friends', requesterId);
        const requesterFriendDoc = doc(db, 'Users', requesterId, 'friends', currentUserId);
    
        try {
            // Add each user to the other's friends list
            await setDoc(currentUserFriendDoc, {
                timestamp: new Date(),
            });
            console.log('Added to current user\'s friends list'); // Debugging
    
            await setDoc(requesterFriendDoc, {
                timestamp: new Date(),
            });
            console.log('Added to requester\'s friends list'); // Debugging
    
            // Remove friend request from array
            await updateDoc(currentUserRef, {
                friendRequests: arrayRemove(requesterId),
            });
            console.log('Removed friend request from current user\'s friendRequests array'); // Debugging
    
            // Update the state to remove the accepted friend request
            setFriendRequests((prev) => {
                const updatedRequests = prev.filter((id) => id !== requesterId);
                updateFriendRequestDetails(updatedRequests); // Update friendRequestDetails
                return updatedRequests;
            });
            console.log('Updated state to remove accepted friend request'); // Debugging
        } catch (error) {
            console.error('Error accepting friend request:', error);
        }
    };

    // const handleReject = async (requesterId) => {
    //     const currentUserRef = doc(db, 'Users', currentUserId);

    //     try {
    //         // Remove the requester from the friendRequests array
    //         await updateDoc(currentUserRef, {
    //             friendRequests: arrayRemove(requesterId),
    //         });

    //         setFriendRequests((prev) => prev.filter((id) => id !== requesterId));
    //     } catch (error) {
    //         console.error('Error rejecting friend request:', error);
    //     }
    // };

    const handleReject = async (requesterId) => {
        const currentUserRef = doc(db, 'Users', currentUserId);
    
        try {
            // Remove the requester from the friendRequests array
            await updateDoc(currentUserRef, {
                friendRequests: arrayRemove(requesterId),
            });
    
            // Update the state to remove the rejected friend request
            setFriendRequests((prev) => {
                const updatedRequests = prev.filter((id) => id !== requesterId);
                updateFriendRequestDetails(updatedRequests); // Update friendRequestDetails
                return updatedRequests;
            });
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
                {friendRequestDetails.length === 0 ? (
                    <p>No friend requests at the moment.</p>
                ) : (
                    friendRequestDetails.map((requester) => (
                        <div key={requester.id} className="friend-request">
                            <p>{requester.username}</p>
                            <button onClick={() => handleAccept(requester.id)}>Accept</button>
                            <button onClick={() => handleReject(requester.id)}>Reject</button>
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