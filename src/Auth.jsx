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
import {userFactory, printUserdata, userStateChangeHandler} from './Auth_tools';

// css for auth page/component
import "./Auth.css";


function AuthPage({props}) {
	const [formData, setFormData] = useState({
		email: "",
		password: ""
	})
	const [preference, setPreference] = useState({
		login: true,
		register: false
	}); 
	const {user, setUser} = props;

	useEffect(() => {
		onAuthStateChanged(auth, (currentUser) => {
			userStateChangeHandler(currentUser, setUser);
		});
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
		<div className='login_page no_user' >
			<div>
{ user ?				<form	className="login_form"
						onSubmit={(ev) => {ev.preventDefault()}}
						method="POST">
						
						<label htmlFor="email">
							<input onChange={changeHandler} required type="email" name="email" id="email" value={formData.name} placeholder='Email' />
						</label>
	
						<label htmlFor="password">
							<input onChange={changeHandler} required type="password"  name='password' value={formData.password} placeholder='Password'/>
						</label>

						<div className='login_buttons' >
							{preference.register && <button type='button'  onClick={submitHandler} > Register </button>}
							{preference.login && <button type='button' onClick={user? logout : login}> {user ? "Logout" : "Login"}  </button>}
							{preference.register && <button className='google_login' type='button' onClick={signInWithGoogle} > {preference.login ? "Login" : "Register"} with Google </button> }
							{preference.register && <button className='guest_login' type='button' title='You may lose your data, Use only for testing reasons' onClick={() => {signInAnonymously(auth); console.log("ANON AUTH")}} >* Continue as guest *</button>}
							<button className='login_option' type='button'  onClick={() => { setPreference(old => ({register: !old.register, login: !old.login})) }}  > or {preference.login ? "register" : "login"} now {"->"} </button>
							{/* <p>{user?.email}</p>
							<p>{user?.displayName}</p> */}
						</div>
				</form> : 
				<div className="user_info">
					<p>{user?.name}</p>
					<p>{user?.email}</p>
				</div>
}
			</div>
		</div>
	)
}


export {AuthPage};
