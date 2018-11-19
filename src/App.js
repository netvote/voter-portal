import React, { Component } from 'react';
import logo from './assets/img/brand/netvote_mark_512.png';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Netvote Voter Portal
          </p>
          <a
            className="App-link"
            href="https://citizendata.network/"
            target="_blank"
            rel="noopener noreferrer"
          >
            CitizenData
          </a>
        </header>
      </div>
    );
  }
}

export default App;
