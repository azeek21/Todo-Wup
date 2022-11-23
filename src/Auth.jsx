import { useEffect, useState } from 'react';
import {auth, signInWithGoogle, db} from './firebase-config';
import {
	onAuthStateChanged,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	signInAnonymously,
} from "firebase/auth";
import {setDoc, doc, getDoc} from "firebase/firestore";
import dayjs from 'dayjs';


function AuthPage({props}) {
	const [formData, setFormData] = useState({
		email: "",
		password: ""
	})
	const {user, setUser} = props;

	useEffect(() => {
		onAuthStateChanged(auth, (currentUser) => {
			const  getUser = async () => {
				console.log("User change");
				console.log(currentUser?.uid);
				if (currentUser.uid) {
				  const userRef = doc(db, "users", currentUser.uid);
				  console.log("USERDOC CREATED")
				  const userDoc = await getDoc(userRef);
				  let userData = userDoc.data();
				  if (userDoc.exists()) {
					console.log("EXISTS ")
					console.log(userData.email);
					console.log(userData.name);
					console.log(userData.uid);
					console.log(userData.joinDate);
					console.log(dayjs.unix(userData.joinDate).format("DD:MM:YYYY HH:mm"));
					setUser(userData);
				  }
				  else {
					console.log("NOT EXIST");
					
					console.log("Adding user ...")
					userData = {
					  name: currentUser.displayName,
					  email: currentUser.email,
					  phone: currentUser.phoneNumber,
					  uid: currentUser.uid,
					  photoUrl: currentUser.photoURL,
					  isAnonymous: currentUser.isAnonymous,
					  emailVerified: currentUser.emailVerified,
					  joinDate: dayjs().unix(),
					  todos: [],
					}

					try{
					  await setDoc(userRef, userData);
					  console.log("USER ADD SUCCESS")
					  setUser(userData);
					} catch (error) {
					  console.log(error);
					}
				  }
				}
				else {
				  console.log("USER NOT LOGGED IN");
				}
			  };
			  getUser();
		})
	}, [])

	const register = async () => {
		try{
			console.log(formData)
		const user = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
		console.log(user);
		} catch (error) {
			console.log(error);
		}
	};

	const login = async () => {
		try {
			const user = await signInWithEmailAndPassword(auth, formData.email, formData.password);
		} catch (error) {
			console.log(error);
		}
	};

	const logout = async () => {
		signOut(auth);
	};

	const changeHandler = (ev) => {
		console.log(ev.target.name, ev.target.value);
		setFormData(oldform => ({...oldform, [ev.target.name]: ev.target.value}));
	};


	const submitHandler = (ev) => {
		console.log("post ...")
		ev.preventDefault();
		register();
	}
	return (
		<div className='login_page' >
			<div className="login_form">
				<form onSubmit={(ev) => {ev.preventDefault()}} method="POST" className="login__form">
					<label htmlFor="email">
						<input onChange={changeHandler} required type="email" name="email" id="email" value={formData.name} placeholder='example@gmail.com' />
					</label>
	
					<label htmlFor="password">
						<input onChange={changeHandler} required type="password"  name='password' value={formData.password} placeholder='ExamplePassword@12345'/>
					</label>
					<button type='button'  onClick={submitHandler} >Submit</button>
					<button type='button' onClick={user? logout : login}> {user ? "Logout" : "Login"}  </button>
					<button type='button' onClick={signInWithGoogle} > Google Sign In  </button>
					<button type='button' onClick={() => {signInAnonymously(auth); console.log("ANON AUTH")}} > Anon auth  </button>
					<button onClick={() => {}} > Getusers </button>
					<p>{user?.email}</p>
					<p>{user?.displayName}</p>
					{/* <p>{user?.}</p> */}
				</form>
			</div>
		</div>
	)
}

export {AuthPage};
