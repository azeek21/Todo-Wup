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
  
  const [user, setUser] = useState(null);

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
  }

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
      {user && <Todos />}
    </div>
  )
}

export default App








{/* <section className="form__container">
{UserForm({changeHandler, submitHandler, ...formState})}
</section> */}