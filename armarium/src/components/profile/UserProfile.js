import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function ProfileSettings() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');

    const navigate = useNavigate();

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        navigate('/suggestions');
    };
}