import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig';

/**
 * Sends a friend request from one user to another.
 * @param {string} fromUserId - The UID of the user sending the request.
 * @param {string} toUsername - The username of the user receiving the request.
 * @returns {Promise<string>} - A message indicating the result.
 */
export const sendFriendRequest = async (fromUserId, toUsername) => {
    try {
      // 1. Find recipient user by username
      const usersRef = doc(db, 'usernames', toUsername); // optional index collection
      const userDoc = await getDoc(usersRef);
  
      if (!userDoc.exists()) {
        return 'User not found.';
      }
  
      const toUserId = userDoc.data().uid;
  
      if (toUserId === fromUserId) {
        return "You can't send a friend request to yourself.";
      }
  
      // 2. Add fromUserId to the recipient's friendRequests array
      const toUserRef = doc(db, 'Users', toUserId);
      await updateDoc(toUserRef, {
        friendRequests: arrayUnion(fromUserId),
      });
  
      return 'Friend request sent!';
    } catch (error) {
      console.error('Error sending friend request:', error);
      return 'Failed to send friend request.';
    }
  };