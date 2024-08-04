import React, { useState } from 'react';
import { storage, db, auth, signInWithEmailAndPassword } from '../backend/firebaseConfig'; // Adjust the import path if necessary
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ImageUpload = () => {
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");
  const [progress, setProgress] = useState(0);

  const handleChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!auth.currentUser) {
        console.error('User is not authenticated');
        return;
      }  
    if (image) {
      const storageRef = ref(storage, `images/${image.name}`);
      const uploadTask = uploadBytesResumable(storageRef, image);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Progress function
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(progress);
        },
        (error) => {
          // Error function
          console.log(error);
        },
        () => {
          // Complete function
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            setUrl(url);
            addDoc(collection(db, "images"), {
              url: url,
              createdAt: serverTimestamp()
            });
          });
        }
      );
    }
  };

  return (
    <div>
      <progress value={progress} max="100" />
      <br />
      <input type="file" onChange={handleChange} />
      <button onClick={handleUpload}>Upload</button>
      <br />
      {url && <img src={url} alt="Uploaded" style={{ width: "300px" }} />}
    </div>
  );
};

export default ImageUpload;
