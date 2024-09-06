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
import UserInfo from './Login/userInfo';
import Wardrobe from './clothing/Wardrobe';
import HeightAndWeight from './Questionare/HeightAndWeight';
import Brands from './Questionare/Brands';
import Styles from './Questionare/Styles';
import Ocassions from './Questionare/Ocassions';
import EditClothing from './clothing/EditClothing';

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
        <Route path="/userInfo" element={<UserInfo />}/>
        <Route path="/wardrobe" element={<Wardrobe />}/>
        <Route path="/heightAndWeight" element={<HeightAndWeight />}/>
        <Route path="/brands" element={<Brands />}/>
        <Route path="/styles" element={<Styles />}/>
        <Route path="/occasions" element={<Ocassions />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/editClothing/:clothingId/:type" element={<EditClothing />}/>
      </Routes>
    </Router>
  );
}

export default App;
