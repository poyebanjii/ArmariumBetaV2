// components/UserSearch.js
import React, { useState } from 'react';
import { sendFriendRequest } from '../utils/friends';

function UserSearch({ currentUserId }) {
  const [searchUsername, setSearchUsername] = useState('');
  const [message, setMessage] = useState('');

  const handleSendRequest = async () => {
    const result = await sendFriendRequest(currentUserId, searchUsername.trim());
    setMessage(result);
  };

  return (
    <div className="user-search">
      <h2>Find a Friend</h2>
      <input
        type="text"
        placeholder="Enter username"
        value={searchUsername}
        onChange={(e) => setSearchUsername(e.target.value)}
      />
      <button onClick={handleSendRequest}>Send Friend Request</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default UserSearch;
