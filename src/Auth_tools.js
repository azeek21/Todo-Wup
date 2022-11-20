import {
	onAuthStateChanged,
	signOut,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signInWithPopup,
	GoogleAuthProvider,
} from "firebase/auth";

import {auth} from './firebase-config';

const providerGoogle = new GoogleAuthProvider();

const signInWithGoogle = () => {
	signInWithPopup(auth, providerGoogle)
		.then(result => {
			console.log(result);
		})
		.catch(error => {
			console.log(error);
		});
};

const register = async (data) => {
	try{
		console.log(data)
	const user = await createUserWithEmailAndPassword(auth, data.email, data.password);
	console.log(user);
	} catch (error) {
		console.log(error);
	};
};

const login = async (data) => {
	try {
		const user = await signInWithEmailAndPassword(auth, data.email, data.password);
	} catch (error) {
		console.log(error);
	}
};

const logout = async () => {
	signOut(auth);
};


