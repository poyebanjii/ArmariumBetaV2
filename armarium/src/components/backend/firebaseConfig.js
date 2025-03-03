import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { getAuth , signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA2Aik6r6OkxNb2dRwNqK5ySt1ObqRLaUU",
  authDomain: "armarium-mvp-v2.firebaseapp.com",
  projectId: "armarium-mvp-v2",
  storageBucket: "armarium-mvp-v2.firebasestorage.app",
  messagingSenderId: "1040040253196",
  appId: "1:1040040253196:web:85f0bd3b94f71c0670db29",
  measurementId: "G-22GSC3RPHN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

setPersistence(auth, browserLocalPersistence) 
  .then(() => {
    console.log('Firebase Auth persistence set to local');
  })
  .catch((error) => {
    console.error('Error setting persistence:', error);
  });
export { db, storage, auth, signInWithEmailAndPassword, analytics};
