import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

// imported components
import Todos from './Todo';
import {AuthPage} from './Auth'
// firebase
import {collection, getDocs, addDoc} from "firebase/firestore";
// db
// import {db} from './firebase-config';



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
  
  const [users, setUsers] = useState([]);

  // const userCollectioRef = collection(db, "users");
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
    const  getUsers = async () => {
      // const data = await getDocs(userCollectioRef);
      // setUsers(data.docs.map((doc) => ({id: doc.id , ...doc.data()})))
    };
    getUsers();
  }, [users.length > 0])

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
      {
        Todos({userId: users.length > 0 ? users.filter(user => user.username == "test")[0].id : ""})
        }
    </div>
  )
}

export default App








{/* <section className="form__container">
{UserForm({changeHandler, submitHandler, ...formState})}
</section> */}