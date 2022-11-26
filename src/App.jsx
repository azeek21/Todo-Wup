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

  const [user, setUser] = useState(null);
  const [is_auth, setIs_auth] = useState(false);

  return (
    <div className="App">
      <AuthPage props={{ user, setUser, is_auth, setIs_auth }} />
      {user && <Todos props={{ user, is_auth, setIs_auth }} />}
    </div>
  )
}

export default App