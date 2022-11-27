import { initializeApp } from "firebase/app"
import {getFirestore} from  "@firebase/firestore";
import {getStorage} from "firebase/storage"

import {
	getAuth,
	GoogleAuthProvider,
	signInWithPopup,
	updateProfile
} from 'firebase/auth';

const firebaseConfig = {

	apiKey: "AIzaSyB8bisfJ7yI6beDbbw8ViLSu7H768rBWzY",
  
	authDomain: "todo-b2268.firebaseapp.com",
  
	projectId: "todo-b2268",
  
	storageBucket: "todo-b2268.appspot.com",
  
	messagingSenderId: "468019774901",
  
	appId: "1:468019774901:web:290161d47ec78b178605fc",
  
	measurementId: "G-M862DDKJLL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const auth = getAuth(app);
const providerGoogle = new GoogleAuthProvider();

 const signInWithGoogle = () => {
	signInWithPopup(auth, providerGoogle).then((result) => {
		console.log(result);
	}).catch((error) => {
		console.log(error);
	});
};


export {db, auth, signInWithGoogle, updateProfile, storage};
