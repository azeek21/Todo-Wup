import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// firebase configs here
// import { initializeApp } from "firebase/app"
// import { getAnalytics } from "firebase/analytics";

// // TODO: Add SDKs for Firebase products that you want to use

// // https://firebase.google.com/docs/web/setup#available-libraries


// // Your web app's Firebase configuration

// // For Firebase JS SDK v7.20.0 and later, measurementId is optional

// const firebaseConfig = {

//   apiKey: "AIzaSyB8bisfJ7yI6beDbbw8ViLSu7H768rBWzY",

//   authDomain: "todo-b2268.firebaseapp.com",

//   projectId: "todo-b2268",

//   storageBucket: "todo-b2268.appspot.com",

//   messagingSenderId: "468019774901",

//   appId: "1:468019774901:web:290161d47ec78b178605fc",

//   measurementId: "G-M862DDKJLL"

// };


// // Initialize Firebase

// const app = initializeApp(firebaseConfig);

// const analytics = getAnalytics(app);



ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
)
