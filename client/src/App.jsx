import React, { useState, useEffect } from "react";
import { Route, Link, Routes, useNavigate, useLocation } from 'react-router-dom';

import './App.css';
import './styles.css';

import Login from './components/Login.jsx';
import Home from './components/Home.jsx';
import NotFound from './components/NotFound.jsx';
import Response from './components/Response.jsx';
import Tournament from "./components/tournament/Tournament.jsx";
import TourCreator from "./components/tournament/TourCreator.jsx";

import UserProfile from "./closures/UserProfile.jsx";

const server = "http://localhost:8080/";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);  

  // useEffect(()=>{
  //   UserProfile.get();
  // },[])

  const navigate = useNavigate();
  // const location = useLocation();

  // const { hash, pathname, search } = location;

  const handleRegister = function(form_data) {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form_data)
    };
    var status = null;
    fetch(server+"register",requestOptions)
      .then((response) => {
        status = response.status
        return response.json()})
      .then((data) => {
        return navigate(`/response/${status}/${data.message}`)
      });
  }
  const handleLogin = function(form_data) {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form_data)
    };
    var status = null;
    fetch(server+"login",requestOptions)
    .then((response) => {
      status = response.status
      return response.json()})
    .then((data) => {
      if (status >= 400){
        return navigate(`/response/${status}/${data.message}`);
      } else {
        setLoggedIn(true);
        UserProfile.set(data.email,data.token);
      }
    });
  }

  return (
    <div class="main column fill">
      <header class="row fill">
        <h1>
          <Link to="/">
          Online Tournament
          </Link>
        </h1>
        {!loggedIn &&
          <div class="column">
            <div>Not logged in</div>
            <Link to="/login">Login</Link>
          </div>
        }
        {
          loggedIn &&
          <div class="column">
            <div>Logged in as</div>
            <div>{UserProfile.get().login}</div>
          </div>
        }
      </header>
      <div class="response">
        
      </div>
      <div class="center">
        <Routes>
          <Route path="/" element={<Home serverUrl={server} pagination={10}/>}/>
          <Route path="/:page" element={<Home serverUrl={server} pagination={10}/>}/>
          <Route path="/register" element={<Login onSubmit={handleRegister} registerMode={true}/>}/>
          <Route path="/login" element={<Login onSubmit={handleLogin} registerMode={false}/>}/>
          <Route path="/*" element={<NotFound/>}/>
          <Route path="/response/:status/:message" element={<Response/>}/>
          <Route path="/tournament/:id" element={<Tournament serverUrl={server}/>}/>
          <Route path="/tournamentCreator" element={<TourCreator/>}></Route>
        </Routes>
      </div>
      <footer class="center">
        Designed by Łukasz Andryszewski
      </footer>
    </div>
  );
}

export default App;
