import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

// imported components
import Todos from './Todo';
import {AuthPage} from './Auth'
// firebase
import {collection, getDoc, setDoc, doc} from "firebase/firestore";
// db
import {db} from './firebase-config';
import dayjs from 'dayjs';



function UserForm(prop) {
  return (
  <form onSubmit={ev => {ev.preventDefault(); prop.submitHandler()}} className='form' >
      <label htmlFor="userName"> Username
        <input onChange={(ev) => {prop.changeHandler(ev)}} type="text" name="username" id='userName' placeholder='Name'  value={prop.username}/>
      </label>

      <label htmlFor="fullName"> Full Name
        <input onChange={(ev) => {prop.changeHandler(ev)}} type="text" name="name" id="fullName" placeholder='Full Name' value={prop.name} />
      </label>

      <label htmlFor="age"> Age
        <input onChange={(ev) => {prop.changeHandler(ev)}} type="number" name="age" id='age' placeholder='Age..' value={prop.age}/>
      </label>

      <button className='form__submit__btn'> Add </button>
  </form>
  );
}


function App() {
  
  const [user, setUser] = useState({});

  const userCollectioRef = collection(db, "users");
  const [formState, setFormState] = useState({
    name: "",
    username: "",
    age: ""
  })

  useEffect(() => {
     
  }, [])

  const createUser = async () => {
    console.log("ADDING...")
    // await addDoc(userCollectioRef, formState).then(setUsers([]));
  }

  useEffect(() => {
    const  getUser = async () => {
      console.log("User change");
      console.log(user?.uid);
      if (user.uid) {
        const userRef = doc(db, "users", user.uid);
        console.log("USERDOC CREATED")
        const userDoc = await getDoc(userRef);
        let userData = userDoc.data();
        console.log("userDATA:", userData);
        if (userDoc.exists()) {
          console.log("EXISTS ")
          console.log(userData.email);
          console.log(userData.name);
          console.log(userData.id);
          console.log(userData.phone)
          console.log(userData.joinDate);
          console.log(dayjs.unix(userData.joinDate).format("DD:MM:YYYY HH:mm"));
          setUser(userData);
        }
        else {
          console.log("NOT EXIST");

          userData = {
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
          await setDoc(userRef, userData);
          console.log("USER SET SUCCESS")          
        }
      }
      else {
        console.log("USER NOT LOGGED IN");
      }
    };
    getUser();
  }, []);

  const changeHandler = (ev) => {
    // console.log(ev.target.name, ev.target.value)
    setFormState(old => {return {...old, [ev.target.name]: ev.target.value}});
  }

  const submitHandler = () => {
    // console.log(formState);
    createUser();
  }
  return (
    <div className="App">
      <AuthPage props={{user, setUser}} />
      <Todos />
    </div>
  )
}

export default App








{/* <section className="form__container">
{UserForm({changeHandler, submitHandler, ...formState})}
</section> */}