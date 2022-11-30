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
 // firebase api key and other things go here ;
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
