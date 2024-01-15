import React, { useState, useEffect } from "react";
import { Route, Link, Routes, useLocation } from 'react-router-dom';
import './App.css';
import Login from './components/Login.jsx';
import Home from './components/Home.jsx';

const server = "http://localhost:8080/"

function App() {
  // const location = useLocation();

  // const { hash, pathname, search } = location;

  const handleRegister = function(form_data) {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form_data)
    };
    fetch(server+"register",requestOptions)
      .then(response => response.json())
      .then(data => this.setState({ postId: data.id }));
  }

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login onSubmit={handleRegister}/>}/>
      </Routes>
    </div>
  );
}

export default App;
