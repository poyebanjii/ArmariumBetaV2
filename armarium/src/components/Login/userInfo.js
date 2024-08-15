import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/App.css';

function UserInfo() {
    const [gender, setGender] = useState("-");
    const [skin, setSkin] = useState("-");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (gender === "male" || gender === "female") {
            navigate("/register");
        } else {
            alert("Please select a gender.");
        }
    };


    return (
        <div className="App">
            <h2>Gender</h2>
            <br />
            <form onSubmit={handleSubmit}>
                <select onChange={(e) => setGender(e.target.value)} value={gender}>
                    <option value="-">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
                <br />
                <select onChange={(e) => setSkin(e.target.value)} value={skin}>
                    <option value="-">Select Skin</option>
                    <option value="skin1">Male</option>
                    <option value="female">Female</option>
                </select>
                <br />
                <button type="submit" className="btn btn-dark">Submit</button>
            </form>
        </div>
    );
}


export default UserInfo;
