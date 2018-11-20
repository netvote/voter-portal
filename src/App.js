import React, { Component } from 'react';
import { Switch, HashRouter as Router, Route, Link } from 'react-router-dom'
import './App.css';

//Custom CitizenData Login Pages
import Login from './views/Pages/Login';
import Ballot from './views/Pages/Ballot';
class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <Switch>
            <Route path="/email/:electionId" name="Home" component={Login} />
            <Route path="/ballot/:electionId/:token" name="Ballot" component={Ballot} />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
