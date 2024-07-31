import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login/Login'
import Register from './Login/Register';
import ForgotPassword from './Login/ForgotPassowrd';
import NewPassword from './Login/NewPassowrd';
import Tinder from './clothing/Tinder';
import Outfit from './clothing/Oufit';
import Suggestions from './clothing/Suggestions';
import ProfileSettings from './profile/ProfileSettings';
import ImageUpload from './clothing/imageUpload';
import ItemUpload from './clothing/itemUpload';

/**
 * The routers for linking to different pages.
 * @returns The routers.
 */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />}/>
        <Route path="/new-password" element={<NewPassword />}/>
        <Route path="/clothes-swipe" element={<Tinder />}/>
        <Route path="/outfits" element={<Outfit />}/>
        <Route path="/suggestions" element={<Suggestions />}/>
        <Route path="/profileSettings" element={<ProfileSettings />}/>
        <Route path="/imageUpload" element={<ImageUpload />}/>
        <Route path="/itemUpload" element={<ItemUpload />}/>

      </Routes>
    </Router>
  );
}

export default App;
