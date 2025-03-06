// src/SplashScreen.js
import React from 'react';
import '../styles/SplashScreen.css';
import logo from '../styles/logo.png';

const SplashScreen = () => {
  return (
      <img src={logo} alt="App Logo" className="splash-image" />
  );
};

export default SplashScreen;