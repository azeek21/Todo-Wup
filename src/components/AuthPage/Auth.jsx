/**
 * all neded import here
 */
import { useEffect, useState } from 'react';
import {auth, signInWithGoogle, db} from '../../firebase-config';
import {
	onAuthStateChanged,
	signInAnonymously,
} from "firebase/auth";
import {userStateChangeHandler, registerUser, loginUser, logoutUser} from './Auth_tools';

// css for auth page/component
import "./Auth.css";


/**
 * AuthPage function component ;
 * @param {props} {user, setUser, isAuth, setAuth}  to manipulate data axross Authentication page and App ;
 * @var formData data of all form inputs for user to log in or register
 * @var preference {login: bool, register: bool} to keep user's preferences sortet.
 * later will be needed for some login and registration logic;
 * @message different messages that user need's to see; @todo: add more error handling and give more messages to user about login status;
 */
function AuthPage({props}) {
	/**
	 * @var formData keeps user's input to form at login | regitration page;
	 * @function setFormData, @argument formData object to update formData variable;
	 */
	const [formData, setFormData] = useState({})

	/**
	 * @var {object} preference keeps the user's preferences like user wants to login or regsiter a new account;
	 * @function setPreference @argument {object} preference  to upate the preference object;
	 */
	const [preference, setPreference] = useState({
		login: true,
		register: false
	});

	/**
	 * @var {string} message message to show on top of form input in case of any error's or warnings;
	 * @function setMessage @argument {message} message  to upate the message string;
	 */
	const [message, setMessage] = useState("");

	/**
	 * @var {object} user inherited from App component that stores user info like user_id name and email
	 * @function setUser inherited from App component, @argument {object} user, updates user object in App component
	 * for availibility in all componets in App. Component Todos and Todo child component of Todos will be using it when needed;
	 */
	const {user, setUser} = props;

	/**
	 * get's executed when this AuthPage component is mounted and assigns,
	 * no dependencies provided so, will not rerun during state changes and updates,
	 * authpage get's remounted again.
	 */
	useEffect(() => {
		/**
		 * @listens FIREBASE_AUTH_STATUS and @fires @async @function userStateChangeHandler 
		 * with @argument currentUser, setUser, setIs_auth from App component.
		 */
		onAuthStateChanged(auth, (currentUser) => {
			userStateChangeHandler(currentUser, setUser, props.setIs_auth);
		});
	}, [])


	/**
	 * @fires loginUser from Auth_tools.js;
	 */
	const login = async () => {

		/**
		 * logs the user in with userData provided.
		 * @function loginUser 
		 * @argument {Object} formData
		 * @argument {function} setMessage
		 */
		loginUser(formData, setMessage);
	};

	/**
	 * @listens input:value change and @fires setFormData
	 * @param {dom_event} ev change event from inputs of the form
	 */
	const changeHandler = (ev) => {
		/**
		 * Updates formData data according to input values by user
		 */
		setFormData(oldform => ({...oldform, [ev.target.name]: ev.target.value}));
	};

	/**
	 * @returns {JSX} AuthPage ;
	 */
	return (
		/**
		 * Div wrapper element for AuthPage component that wraps all login/registration;
		 * className : conditionally rendered according to if user is logged in or not by checking user object;
		 * user is null if there's no logged in users;
		 */
		<div className={`login_page ${!user ? "no_user" : ""}`} >
			<div>
			{/**
			 * conditionally rendering login/resigration form if no user and user is not authenticated;
			 * 
			 */}
			{ !user && !props.is_auth ? <form	className="login_form"
						onSubmit={(ev) => {ev.preventDefault(); !user && preference.login ? login() : preference.register ? registerUser(formData, setMessage) : user ? logoutUser() : () => {}}}
						method="POST">
						{/**
						 * conditionally rendering p elements with message as inner text if there's any error/warrning messages;
						 */}
						{message && <p className='login_error'>{message}</p>}

						 {/**
						  * conditionally rendering input for user's name if user trying to register; will be invisible if user trying to login;
						  */}
						{preference.register && 
							<label htmlFor="name">
								<input onChange={changeHandler} title="Enter your name, REQUIRED" required type="name" name="name" id="name" value={formData.name} placeholder='Casandra Evans' />
							</label>
						}

						{/** 
						 * input field for user email to login or register, required;
						 * 
						*/}

						<label htmlFor="email">
							<input onChange={changeHandler} title="Email address, REQUIRED, no need to verify." required type="email" name="email" id="email" value={formData.email} placeholder='Email' />
						</label>
	
						{/**
						 * input for user password for login or registration ; 
						*/}
						<label htmlFor="password">
							<input onChange={changeHandler} title='At least 6 chars, REQUIRED' required type="password"  name='password' value={formData.password} placeholder='Password'/>
						</label>

						{/**
						 * div element container for buttons of user registration/login form;
						 */}

						<div className='login_buttons' >
							{/** Resgister button will be conditionally rendered according to user's preference of login or registration. will be invisible if user wants to log in */}
							{preference.register && <button> Register </button>}
							{/** Login button, conditionally rendered if user wants to log in and will also be logout and have logout functionality if user already logged in */}
							{preference.login && <button> {user ? "Logout" : "Login"}  </button>}
						 	{/** Register | Login with Google button*/}
							{<button className='google_login' type='button' onClick={signInWithGoogle} > {preference.login ? "Login" : "Register"} with Google </button> }
							{/** Continue with guest account button. Will be available if user wan't to register but not to have an account. High change of losing the data. Good for testing purposes. */}
							{preference.register && <button className='guest_login' type='button' title='You may lose your data, Use only for testing reasons' onClick={() => {signInAnonymously(auth); console.log("ANON AUTH")}} >* Continue as guest *</button>}
							{/** Preference toggler button, toggles user's preferenece between login and registration */}
							<button className='login_option' type='button'  onClick={() => { setPreference(old => ({register: !old.register, login: !old.login})) }}  > or {preference.login ? "register" : "login"} now {"->"} </button>
						</div>
				</form> 
				
				: props.is_auth && !user ? 
				/**
				 * div element loader. will be visible if user is authneticated and user data is being loaded to and from firebase database.
				 */
				<div className="loader"></div>
				
				:
				/**
				 * div elements container for user infos to show on top screen. Will be rendered if user is logged in and app is ready to work.
				 */
				<div className="user_info">
					<div className="user_image">
						<img src={user.photoUrl ? user.photoUrl : "default_pfp.png"} alt="User profile photo"/>
					</div>
					<p>{user.name ? user.name : "Temprorary user"}</p>
					{/** Logout button, will be visible on hover. triggers logoutUser function on click. */}
					<button className='user_logout' onClick={logoutUser}>Log Out</button>
				</div>
			}
			</div>
		</div>
	)
}
 
/**
 * @exports AuthPage  function component;
 */
export {AuthPage};
