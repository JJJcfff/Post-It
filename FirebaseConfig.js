import { initializeApp, getApps } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDPYdDxBs-Tq2-JKr0j-G4nMsppKoCjiU4",
  authDomain: "post-it-1d453.firebaseapp.com",
  projectId: "post-it-1d453",
  storageBucket: "post-it-1d453.appspot.com",
  messagingSenderId: "826390601959",
  appId: "1:826390601959:web:2bdcf864b12e78cc42c242"
};


// Initialize Firebase only if it hasn't been initialized already
let firebaseapp;
if (!getApps().length) {
  firebaseapp = initializeApp(firebaseConfig);
} else {
  firebaseapp = getApps()[0]; // Use the already initialized app
}

const firebaseauth = initializeAuth(firebaseapp, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const firestore = getFirestore(firebaseapp);
const storage = getStorage(firebaseapp);

export { firebaseapp, firebaseauth, firestore, storage};