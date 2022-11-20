import { useEffect, useState } from 'react';
import {auth, signInWithGoogle} from './firebase-config';
import {
	onAuthStateChanged,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	// signInAnonymously,
} from "firebase/auth";

function AuthPage(props) {
	const [formData, setFormData] = useState({
		email: "",
		password: ""
	})
	const [user, setUser] = useState({email: ""});

	useEffect(() => {
		onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
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
	console.log(user);
	return (
		<div className='login_page' >
			<div className="login_form">
				<form onSubmit={(ev) => {ev.preventDefault()}} method="POST" className="login__form">
					<label htmlFor="email">
						<input onChange={changeHandler} type="email" name="email" id="email" value={formData.name} placeholder='example@gmail.com' />
					</label>
	
					<label htmlFor="password">
						<input onChange={changeHandler} type="password"  name='password' value={formData.password} placeholder='ExamplePassword@12345'/>
					</label>
					<button type='button'  onClick={submitHandler} >Submit</button>
					<button type='button' onClick={user? logout : login}> {user ? "Logout" : "Login"}  </button>
					<button type='button' onClick={signInWithGoogle} > Google Sign In  </button>
					<p>{user?.email}</p>
					<p>{user?.displayName}</p>
					{/* <p>{user?.}</p> */}

				</form>
			</div>
		</div>
	)
}

export {AuthPage};
