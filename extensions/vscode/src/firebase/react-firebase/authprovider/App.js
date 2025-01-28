import './App.css';
import { useState } from'react';
import { app, database } from './firebaseConfig.js'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider, 
  signInWithPopup,
  GithubAuthProvider
 } from 'firebase/auth'

function App() {
  const [data, setData] = useState({ 
    email: '', 
    password: '' 
  })
  const auth = getAuth(app);
  const handleInputs = (event) => {
    let inputs = {[event.target.name] : event.target.value};

    setData({...data, ...inputs})
  }

  const handleSubmit = () => {
    createUserWithEmailAndPassword(auth, data.email, data.password)
    .then((response) => {
      console.log(response.user)
    })
    .catch((err) => {
      alert(err.message)
    });
  
  }
  return (
    <div className="App-header">
      <input 
      placeholder="Email" 
      name="email" 
      type="email"
      className="input-fields"
      onChange={event => handleInputs(event)}
      />
      <input
      placeholder="Password" 
      name="password" 
      type="password"
      className="input-fields"
      onChange={event => handleInputs(event)}
      />

      <button onClick={handleSubmit}>Sign Up</button>
    </div>
  );
}

export default App;
