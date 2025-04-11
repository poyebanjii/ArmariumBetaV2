import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig';

/**
 * Sends a friend request from one user to another.
 * @param {string} fromUserId - The UID of the user sending the request.
 * @param {string} toUsername - The username of the user receiving the request.
 * @returns {Promise<string>} - A message indicating the result.
 */
export const sendFriendRequest = async (fromUserId, toUsername) => {
  try {
      // Query the Users collection for the username
      const usersRef = collection(db, 'Users');
      const q = query(usersRef, where('username', '==', toUsername));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
          return 'User not found.';
      }

      // Get the recipient's user ID
      const userDoc = querySnapshot.docs[0];
      const toUserId = userDoc.id;

      if (toUserId === fromUserId) {
          return "You can't send a friend request to yourself.";
      }

      // Add fromUserId to the recipient's friendRequests array
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