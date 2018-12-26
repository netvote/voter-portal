import React, { Component } from 'react';
import { Switch, HashRouter as Router, Route } from 'react-router-dom'
import './App.css';

//Custom CitizenData Login Pages
import Login from './views/Pages/Login';
import Ballot from './views/Pages/Ballot';

//Error Handling Pages
import ExpiredError from './views/Pages/ExpiredError';

import ElectionResults from './views/Pages/Results';

class App extends Component {
  render() {
    window.__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ = true;

    return (
      <div className="App">
        <Router>
          <Switch>
            <Route path="/email/:electionId" name="Home" component={Login} />
            <Route path="/election/:electionId" name="Home" component={Login} />
            <Route path="/ballot/:electionId/:token" name="Ballot" component={Ballot} />
            <Route path="/error/Expired" name="Expired" component={ExpiredError} />
            <Route path="/results/:electionId" name="Results" component={ElectionResults} />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
