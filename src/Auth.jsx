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
import {userStateChangeHandler, registerUser, loginUser, logoutUser} from './Auth_tools';

// css for auth page/component
import "./Auth.css";




/**
 * 
 * @param {props} {user, setUser, isAuth, setAuth}  to manipulate data axross Authentication page and App ;
 * @var formData data of all form inputs for user to log in or register
 * @var preference @implements {login: bool, register: bool} to keep user's preferences sortet.
 * later will be needed for some login and registration loginc;
 * @message different messages that user need's to see; @todo: add more error handling and give more messages to user about login status;
 */
function AuthPage({props}) {
	const [formData, setFormData] = useState({})
	const [preference, setPreference] = useState({
		login: true,
		register: false
	});
	const [message, setMessage] = useState("");
	const {user, setUser} = props;

	/**
	 * get's executed when this AuthPage component is mounted and assigns,
	 * no dependencies provided so, will not rerun during state changes and updates,
	 * authpage get's remounted again.
	 */
	useEffect(() => {
		/**
		 * @listens FIREBASE_AUTH_STATUS and @fires @async @function userStateChangeHandler 
		 * with @argument currentUser, setUser, 
		 */
		onAuthStateChanged(auth, (currentUser) => {
			userStateChangeHandler(currentUser, setUser, props.setIs_auth);
		});
	}, [])


	const login = async () => {
		loginUser(formData, setMessage);
	};

	const changeHandler = (ev) => {
		setFormData(oldform => ({...oldform, [ev.target.name]: ev.target.value}));
	};

	return (
		<div className={`login_page ${!user ? "no_user" : ""}`} >
			<div>
			{ !user && !props.is_auth ? <form	className="login_form"
						onSubmit={(ev) => {ev.preventDefault(); !user && preference.login ? login() : preference.register ? registerUser(formData, setMessage) : user ? logoutUser() : () => {}}}
						method="POST">
						{message && <p className='login_error'>{message}</p>}

						{preference.register && 
							<label htmlFor="name">
								<input onChange={changeHandler} title="Enter your name, REQUIRED" required type="name" name="name" id="name" value={formData.name} placeholder='Casandra Evans' />
							</label>
						}

						<label htmlFor="email">
							<input onChange={changeHandler} title="Email address, REQUIRED, no need to verify." required type="email" name="email" id="email" value={formData.email} placeholder='Email' />
						</label>
	
						<label htmlFor="password">
							<input onChange={changeHandler} title='At least 6 chars, REQUIRED' required type="password"  name='password' value={formData.password} placeholder='Password'/>
						</label>

						<div className='login_buttons' >
							{preference.register && <button> Register </button>}
							{preference.login && <button> {user ? "Logout" : "Login"}  </button>}
							{preference.register && <button className='google_login' type='button' onClick={signInWithGoogle} > {preference.login ? "Login" : "Register"} with Google </button> }
							{preference.register && <button className='guest_login' type='button' title='You may lose your data, Use only for testing reasons' onClick={() => {signInAnonymously(auth); console.log("ANON AUTH")}} >* Continue as guest *</button>}
							<button className='login_option' type='button'  onClick={() => { setPreference(old => ({register: !old.register, login: !old.login})) }}  > or {preference.login ? "register" : "login"} now {"->"} </button>
						</div>
				</form> 
				
				: props.is_auth && !user ? 
				
				<div className="loader"></div>
				
				:
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
