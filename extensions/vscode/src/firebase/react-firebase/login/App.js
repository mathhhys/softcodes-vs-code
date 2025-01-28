import './App.css';
import { useState } from'react';
import { app, database } from './firebaseConfig.js'
import { 
  getAuth, 
  signInWithEmailAndPassword,
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
  const googleProvider = new GoogleAuthProvider();
  const githubProvider = new GithubAuthProvider();
  const handleInputs = (event) => {
    let inputs = {[event.target.name] : event.target.value};

    setData({...data, ...inputs})
  }

  const handleSubmit = () => {
    if (data.email && data.password) {
      signInWithEmailAndPassword(auth, data.email, data.password)
        .then((response) => {
          console.log(response.user)
        })
        .catch((err) => {
          alert(err.message)
        });
    } else if (data.provider === 'google') {
      signInWithPopup(auth, googleProvider)
        .then((result) => {
          const user = result.user;
          console.log(user);
        })
        .catch((error) => {
          alert(error.message);
        });
    } else if (data.provider === 'github') {
      signInWithPopup(auth, githubProvider)
        .then((result) => {
          const user = result.user;
          console.log(user);
        })
        .catch((error) => {
          alert(error.message);
        });
    } else {
      alert("Please select a valid authentication method");
    }
  };
  
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

      <button onClick={handleSubmit}>Sign in</button>
      <button onClick={handleSubmit}>Sign in</button>
      <button 
        className="google-btn"
        onClick={() => {
          setData({...data, provider: 'google'});
          handleSubmit();
        }}
      >
        <div className="google-icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
        </div>
        <span className="btn-text">Sign in with Google</span>
      </button>
      
      <button onClick={() => {
        setData({...data, provider: 'github'});
        handleSubmit();
      }}>
        <button class="github-button">
          <svg class="github-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
            <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
          </svg>
          <span class="button-text">Sign in with GitHub</span>
        </button>
      </button>
    </div>
  );
}

export default App;
