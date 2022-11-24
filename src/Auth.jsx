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
import {userFactory, printUserdata, userStateChangeHandler, registerUser, loginUser, logoutUser} from './Auth_tools';

// css for auth page/component
import "./Auth.css";


function AuthPage({props}) {
	const [formData, setFormData] = useState({})

	const [preference, setPreference] = useState({
		login: true,
		register: false
	});
	const [message, setMessage] = useState("");
	const {user, setUser} = props;

	useEffect(() => {
		onAuthStateChanged(auth, (currentUser) => {
			userStateChangeHandler(currentUser, setUser);
		});
	}, [])


	const login = async () => {
		loginUser(formData, setMessage);
	};

	const changeHandler = (ev) => {
		setFormData(oldform => ({...oldform, [ev.target.name]: ev.target.value}));
	};

	const submitHandler = (ev) => {
		ev.preventDefault();
		registerUser(formData, setMessage);
	}

	return (
		<div className={`login_page ${!user ? "no_user" : ""}`} >
			<div>
			{ !user ? <form	className="login_form"
						onSubmit={(ev) => {ev.preventDefault(); !user ? login() : preference.register ? register() : logoutUser()}}
						method="POST">
						{message && <p className='login_error'>{message}</p>}

						<label htmlFor="name">
							<input onChange={changeHandler} required type="name" name="name" id="name" value={formData.name} placeholder='Casandra Evans' />
						</label>

						<label htmlFor="email">
							<input onChange={changeHandler} required type="email" name="email" id="email" value={formData.email} placeholder='Email' />
						</label>
	
						<label htmlFor="password">
							<input onChange={changeHandler} required type="password"  name='password' value={formData.password} placeholder='Password'/>
						</label>

						<div className='login_buttons' >
							{preference.register && <button type='submit'  onClick={submitHandler} > Register </button>}
							{preference.login && <button> {user ? "Logout" : "Login"}  </button>}
							{preference.register && <button className='google_login' type='button' onClick={signInWithGoogle} > {preference.login ? "Login" : "Register"} with Google </button> }
							{preference.register && <button className='guest_login' type='button' title='You may lose your data, Use only for testing reasons' onClick={() => {signInAnonymously(auth); console.log("ANON AUTH")}} >* Continue as guest *</button>}
							<button className='login_option' type='button'  onClick={() => { setPreference(old => ({register: !old.register, login: !old.login})) }}  > or {preference.login ? "register" : "login"} now {"->"} </button>
						</div>
				</form> : 
				<div className="user_info">
					<div className="user_image">
						<img src={user.photoUrl ? user.photoUrl : "default_pfp.png"} alt="User profile photo"/>
					</div>
					<p>{user.name ? user.name : "Temprorary user"}</p>
					<button className='user_logout' onClick={logoutUser}>Log Out</button>
				</div>
			}
			</div>
		</div>
	)
}
 

export {AuthPage};
