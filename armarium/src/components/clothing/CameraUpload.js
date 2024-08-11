import React, { useState, useRef, useEffect } from 'react';
import {Camera} from "react-camera-pro";
//import '../styles/Outfits.css';

/**
 * This is the camera page where the user can use their camera
 * to upload an image of their clothing item.
 */
function CameraUpload() {
  const camera = useRef(null);
  const [camImage, setCamImage] = useState(null);
  const [hasWebcam, setHasWebcam] = useState(false);

  useEffect(() => {
      navigator.mediaDevices.enumerateDevices()
          .then(devices => {
              const videoDevices = devices.filter(device => device.kind === 'videoinput');
              setHasWebcam(videoDevices.length > 0);
          })
          .catch(err => console.error('Error checking for webcam:', err));
  }, []);

  const handleTakePhoto = () => {
      if (camera.current) {
          const photo = camera.current.takePhoto();
          setCamImage(photo);
      } else {
          console.error("Camera reference is not available.");
      }
  };

  return (
      <div className='App'>
          <h1>Camera Upload</h1>
          {hasWebcam ? (
              <>
                  <Camera ref={camera} />
                  <button onClick={handleTakePhoto}>Take photo</button>
                  {camImage && <img src={camImage} alt='Taken photo' />}
              </>
          ) : (
              <p>No webcam found or permission denied.</p>
          )}
      </div>
  );
}

export default CameraUpload;
