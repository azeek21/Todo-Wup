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
  const [is_auth, setIs_auth] = useState(false);

  useEffect(() => {
     
  }, [])

  const createUser = async () => {
    console.log("ADDING...")
  }



  return (
    <div className="App">
      <AuthPage props={{user, setUser, is_auth, setIs_auth}} />
      {user && <Todos props={{user, is_auth, setIs_auth}} />}
    </div>
  )
}

export default App








{/* <section className="form__container">
{UserForm({changeHandler, submitHandler, ...formState})}
</section> */}