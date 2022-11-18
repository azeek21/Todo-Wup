import { useState } from 'react';
import {auth} from './firebase-config';
import {createUserWithEmailAndPassword, onAuthStateChanged, signOut} from "firebase/auth";

function AuthPage(props) {
	const [formData, setFormData] = useState({
		email: "",
		password: ""
	})
	const [user, setUser] = useState({});

	onAuthStateChanged(auth, (currentUser) => {
		setUser(currentUser);
	})
	
	const register = async () => {
		try{
		const user = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
		console.log(user);
		} catch (error) {
			console.log(error);
		}
	};
    
	const login = async () => {}; 

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
				<form onSubmit={() => {}} method="POST" className="login__form">
					<label htmlFor="email">
						<input onChange={changeHandler} type="email" name="email" id="email" value={formData.name} placeholder='example@gmail.com' />
					</label>
	
					<label htmlFor="password">
						<input onChange={changeHandler} type="password"  name='password' value={formData.password} placeholder='ExamplePassword@12345'/>
					</label>
					<button  onSubmit={submitHandler} >Submit</button>
					{/* <p>{user.email}</p> */}
				</form>
			</div>
		</div>
	)
}

export {AuthPage};
