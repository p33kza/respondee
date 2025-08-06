// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore'
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB4Qd0Mj4Ozfp8KMFlrVnYbszug6WvSWtI",
  authDomain: "client-respondee.firebaseapp.com",
  projectId: "client-respondee",
  storageBucket: "client-respondee.firebasestorage.app",
  messagingSenderId: "303875836007",
  appId: "1:303875836007:web:55680ebeb7440eb0fd2cc2",
  measurementId: "G-QH395517BW"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

export { auth };

// This config is for testing only and won't use for production