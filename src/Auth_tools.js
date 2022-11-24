import dayjs from "dayjs";
import {
	onAuthStateChanged,
	signOut,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signInWithPopup,
	GoogleAuthProvider,
} from "firebase/auth";
import { getDoc, doc, setDoc } from "firebase/firestore";
import {db, auth, updateProfile} from './firebase-config';

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

const registerUser = async (registerData, setMessage) => {
	try{
		console.table(registerData)
		const user = await createUserWithEmailAndPassword(auth, registerData.email, registerData.password)
								.then((userCred) => { updateProfile(userCred.user, {displayName: registerData.name})});
		console.log(user);
	} catch (error) {
		setMessage(error.message);
		console.log(error);
	};
};

const loginUser = async (loginData, setMessage) => {
	try {
		await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
	} catch (error) {
		setMessage(error.code);
		console.log(error);
	}
};

const logoutUser = async () => {
	signOut(auth);
};

const userFactory = (user) => {
	return {
		name: user.displayName,
		email: user.email,
		phone: user.phoneNumber,
		uid: user.uid,
		photoUrl: user.photoURL,
		isAnonymous: user.isAnonymous,
		emailVerified: user.emailVerified,
		joinDate: dayjs().unix(),
		todos: [],
	  }
}

const printUserdata = (user) => {
	console.table({...user, createdAt: dayjs.unix(user.joinDate).format("DD:MM:YYYY HH:mm")});
}

const userStateChangeHandler = (currentUser, setUser) => {
	async function _handler(currentUser, setUser) {
		console.log("Handling user change ...");
		if (!currentUser) {
			console.log("NO USER");
			setUser(null);
			return ;
		}
		if (currentUser.uid) {
			console.log("USER AUTH SUCCESSFUL ;")
			const userRef = doc(db, "users", currentUser.uid);
			const userDoc = await getDoc(userRef);
			
			if (userDoc.exists()) {
				const userData = userDoc.data();
				console.log("FOUND USER IN DB ENDING LOGIN;")
				setUser(userData);
			}
			else {
				console.log("USER NOT FOUND IN DB, ADDING NOW ...")
				try {
					const userData = userFactory(currentUser);
					await setDoc(userRef, userData);
					console.log("USER ADD SUCCESS ;");
					setUser(userData)
				} catch (error) {
					console.error("FATAL >>> CAN'T ADD USER TO DB :")
					console.log(error.message);
				}
			}
		}
		else 
		{
			console.log("USER NOT LOGGED IN, PLEASE LOGIN ;")
		};
	};

	_handler(currentUser, setUser);
};


export {userFactory, printUserdata, userStateChangeHandler, registerUser, loginUser, logoutUser};
