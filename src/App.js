import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import './App.css';
import logo from './assets/img/brand/netvote_mark_512.png';


//Custom CitizenData Login Pages
import Login from './views/Pages/Login';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
        <Route path="/email/:electionId" name="Home" component={Login} />
        </Router>
      </div>
    );
  }
}

export default App;
