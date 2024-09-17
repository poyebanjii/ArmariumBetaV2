import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import '../styles/App.css';
import { db } from '../backend/firebaseConfig'; // Ensure your firebaseConfig exports db
import Navbar from '../Navbar';

function Suggestions() {
  const [event, setEvent] = useState('');
  const [theme, setTheme] = useState('');
  const [color, setColor] = useState('');
  const [temperature, setTemperature] = useState('');
  const [weatherDesc, setWeatherDesc] = useState('');
  
  const navigate = useNavigate();
  
  const fetchWeatherData = async () => {
    const apiKey = '03ed7d11f60f0f23724d9e14dae193ea';
    const successCallback = async (position) => {
      const { latitude, longitude } = position.coords;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`;

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        console.log('Weather Data:', data);

        const weather = {
          temperature: data.main.temp,
          description: data.weather[0].description,
          city: data.name,
          country: data.sys.country
        };

        // For debugging.
        console.log(`Current weather in ${weather.city}, ${weather.country}:`);
        console.log(`Temperature: ${weather.temperature}°C`);
        console.log(`Description: ${weather.description}`);

        setTemperature(weather.temperature)
        setWeatherDesc(weather.description)
  

      }
      catch (error) {
        console.error('Error fetching data:', error);
      }
      
    }
    const errorCallback = (error) => {
      console.error('Error getting location:', error);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }

  useEffect(() => {
    fetchWeatherData();
}, []);

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      alert('Please log in to submit suggestions.');
      return;
    }

    try {
      await addDoc(collection(db, `Users/${user.uid}/suggestions`), {
        userId: user.uid,
        event,
        theme,
        color,
        weather: weatherDesc,
        temperature: temperature,
        timestamp: new Date()
      });
      console.log('Suggestion submitted successfully');
      alert('Suggestion submitted successfully!');
      navigate('/outfits');
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      alert('Error submitting suggestion. Please try again.');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="App">
      <h2>What to wear?</h2>
      <form onSubmit={handleConfirmSubmit}>
        <label>
          What is the event?
          <input
            type="text"
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          What is the theme?
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          What is the color?
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit" className="confirmButton">Submit</button>
      </form>
      <br />
    </div>
    </div>
  );
}

export default Suggestions;
