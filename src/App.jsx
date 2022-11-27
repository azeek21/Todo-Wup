import { useState, useEffect } from 'react'
import './App.css'

import Todos from './Todo';
import { AuthPage } from './Auth'

/**
 * Creates app, using AuthPage and Todos components 
 * inherited from ./Auth/Auth and ./Todos/Todo respectively.
 * @var user holds global user value which is bassed down to all child components of App;
 * @var is_auth { boolean } state of user being Authenticated by firebase or not.
 *    @default false user will not be authenticated when visiting the site for the first time ;
 * @exports App component to render in root.
 */
function App() {

  /**
   * @var {object} user will have info about user like, email and name
   * @function setUser @argument user object, will be needed to update user object
   */
  const [user, setUser] = useState(null);

  /**
   * @var {boolean} is_auth 
   * @function setIs_auth @argument {boolean} updates user's auth state through app
   */
  const [is_auth, setIs_auth] = useState(false);

  return (
    /**
     * div element container
     */
    <div className="App">
      {/** AuthPage for user login and registration, will stay at top showing user info if user is logged in */}
      <AuthPage props={{ user, setUser, is_auth, setIs_auth }} />
      {/** Todos will be rendered if user is logged in */}
      {user && <Todos props={{ user, is_auth, setIs_auth }} />}
    </div>
  )
}

export default App
