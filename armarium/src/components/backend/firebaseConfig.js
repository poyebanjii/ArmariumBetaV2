import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth , signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyC7BCbxCDv-Bj7rIo-UbRcGB2CWq1DDCYU",
    authDomain: "armarium-6e5c2.firebaseapp.com",
    databaseURL: "https://armarium-6e5c2-default-rtdb.firebaseio.com",
    projectId: "armarium-6e5c2",
    storageBucket: "armarium-6e5c2.appspot.com",
    messagingSenderId: "1063159983320",
    appId: "1:1063159983320:web:94d01bc6a0d9c5ba243bad",
    measurementId: "G-QD9ZNLJ2D5"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence) 
  .then(() => {
    console.log('Firebase Auth persistence set to local');
  })
  .catch((error) => {
    console.error('Error setting persistence:', error);
  });
export { db, storage, auth, signInWithEmailAndPassword};
