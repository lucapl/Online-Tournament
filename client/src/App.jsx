import React, { useState, useEffect } from "react";
import { Route, Link, Routes, useNavigate, useParams, useLocation } from 'react-router-dom';

import './App.css';
import './styles.css';

import Home from './components/Home.jsx';
import Login from './components/user/Login.jsx';
import RegisterConfirm from "./components/RegisterConfirm.jsx";
import NotFound from './components/NotFound.jsx';
import Response from './components/Response.jsx';
import Tournament from "./components/tournament/Tournament.jsx";
import TourCreator from "./components/tournament/TourCreator.jsx";

import UserProfile from "./closures/UserProfile.jsx";
import serverConfig from "./serverConfig.json";
import JoinTournament from "./components/tournament/TournamentJoin.jsx";
import Profile from "./components/user/Profile.jsx";

const server = serverConfig.serverUrl;

function App() {
  const [loggedIn, setLoggedIn] = useState(false);  

  useEffect(()=>{
    const {login,token} = UserProfile.get();
    if (login != ""){
      setLoggedIn(true);
    }
  },[loggedIn])

  const navigate = useNavigate();
  // const location = useLocation();

  // const { hash, pathname, search } = location;

  const handleRegister = function(form_data) {
    var result = window.confirm("User details are unchangable\nAccount cannot be deleted");
    if (!result){
      return null;
    }
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
  const handleLoginForgot = function(form_data){
      const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form_data)
      };
      var status = null;
      fetch(server+"login/forgot",requestOptions)
      .then((response) => {
          status = response.status
          return response.json()})
      .then((data) => {
          return navigate(`/response/${status}/${data.message}`);
      });
    }
  const handleLoginRestart = function(form_data,token){
      const requestOptions = {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify(form_data)
      };
      var status = null;
      fetch(server+"login/restart",requestOptions)
      .then((response) => {
          status = response.status
          return response.json()})
      .then((data) => {
          return navigate(`/response/${status}/${data.message}`);
      });
      }
  const handleLogout = function(){
      UserProfile.clear();
      setLoggedIn(false);
    }

  return (
    <div class="main column fill">
      <header class="row fill">
        <h1 class="empty">
          <Link to="/">
          Online Tournament
          </Link>
        </h1>
        {loggedIn && <Link to="/tournamentCreator">Create Tournament</Link>}
        {!loggedIn && <Link to="/login">Create Tournament</Link>}
        <div class="empty"></div>
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
            <div><Link to={`/user/${UserProfile.get().login}`}>{UserProfile.get().login}</Link></div>
            <button onClick={handleLogout}>Logout</button>
          </div>
        }
      </header>
      <section class="center pad-2">
        <Routes>
          <Route path="/" element={<Home serverUrl={server} pagination={10}/>}/>
          <Route path="/:page" element={<Home serverUrl={server} pagination={10}/>}/>
          <Route path="/register" element={<Login onSubmit={handleRegister} mode={"register"}/>}/>
          <Route path="/login" element={<Login onSubmit={handleLogin} mode={"login"}/>}/>
          <Route path="/login/restart/:token" element={<Login onSubmit={handleLoginRestart} mode={"restart"}/>}/>
          <Route path="/login/forgot" element={<Login onSubmit={handleLoginForgot} mode={"forgot"}/>}/>
          <Route path="/confirm/:token" element={<RegisterConfirm serverUrl={server}/>}></Route>
          <Route path="/tournament/:id" element={<Tournament serverUrl={server}/>}/>
          <Route path="/tournamentCreator" element={<TourCreator serverUrl={server}/>}></Route>
          <Route path="/tournament/edit/:id" element={<TourCreator serverUrl={server}/>}></Route>
          <Route path="/tournament/join/:id" element={<JoinTournament/>}></Route>
          <Route path="/user/:email" element={<Profile/>}></Route>
          <Route path="/*" element={<NotFound/>}/>
          <Route path="/response/:status/:message" element={<Response/>}/>
        </Routes>
      </section>
      <footer class="center">
        Designed by Łukasz Andryszewski
      </footer>
    </div>
  );
}

export default App;
