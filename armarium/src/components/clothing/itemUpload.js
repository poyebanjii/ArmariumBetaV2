import React, { useState } from 'react';
import { storage, db, auth } from '../backend/firebaseConfig';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Navbar from '../Navbar';

const ItemUpload = () => {
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [tags, setTags] = useState("");
  const [color, setColor] = useState("");
  const [itemType, setItemType] = useState("top");
  const [bgRemove, setBgRemove] = useState(null);

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
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(progress);
        },
        (error) => {
          console.log(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            setUrl(url);
            removeBackground(url).then((bgRemoveUrl) => {
              const itemId = `${itemType}-${new Date().getTime()}`;
              addDoc(collection(db, `ItemsCollection/${itemType}/items`), {
                url: bgRemoveUrl || url,
                tags: tags.split(',').map(tag => tag.trim()),
                color: color,
                itemId: itemId,
                createdAt: serverTimestamp(),
              });
            })
          });
        }
      );
    }
  };

  const removeBackground = async (imageUrl) => {
    const apiKey = "izMQbubK4NUk3p24uQn9kBvP"; // At some point this should be in a hidden place. 
    const apiUrl = "https://api.remove.bg/v1.0/removebg";

    const formData = new FormData();
    formData.append("image_url", imageUrl);
    formData.append("size", "auto");

    try {
      const res = await fetch(apiUrl, {
          method: 'POST',
          headers: {
              'X-Api-Key': apiKey
          },
          body: formData
      });

      const data = await res.blob();
      const bgRemovedImageUrl = URL.createObjectURL(data);
      setBgRemove(bgRemovedImageUrl);

      const storageRef = ref(storage, `images/bg-removed-${image.name}`);
      const uploadTask = uploadBytesResumable(storageRef, data);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          null,
          (error) => reject(error),
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then(resolve).catch(reject);
          }
        );
      });

    } catch (error) {
      console.log(error);
      return null;
    }
  };

  return (
    <div>
      <Navbar />
      <div className="App">
      <h2>Upload an Item</h2>
      <progress value={progress} max="100" />
      <br />
      <input type="file" onChange={handleChange} />
      <br />
      <select onChange={(e) => setItemType(e.target.value)} value={itemType}>
        <option value="top">Top</option>
        <option value="bottom">Bottom</option>
      </select>
      <br />
      <br />
      <input
        type="text"
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder="Color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />
      <br />
      <button onClick={handleUpload}>Upload</button>
      <br />
      {url && <img src={bgRemove || url} alt="Uploaded" style={{ width: "300px" }} />}
    </div>
    </div>
  );
};

export default ItemUpload;
