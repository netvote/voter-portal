import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import './App.css';
import logo from './assets/img/brand/netvote_mark_512.png';


//Custom CitizenData Login Pages
import Login from './views/Pages/Login';

class App extends Component {
  render() {
    return (
      // <Router>
      //   <div>
      //     <nav>
      //       <ul>
      //         <li>
      //           <Link to="/">Home</Link>
      //         </li>
      //         <li>
      //           <Link to="/about/">About</Link>
      //         </li>
      //         <li>
      //           <Link to="/users/">Users</Link>
      //         </li>
      //       </ul>
      //     </nav>

      //     <Route path="/" exact component={Login} />
      //     <Route path="/about/" component={Login} />
      //     <Route path="/users/" component={Login} />
      //   </div>
      // </Router>

  
     

      <div className="App">
        {/* <header className="App-header">
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
        </header>  */}
        <Router>
        <Route path="/email/:electionId" name="Home" component={Login} />
        </Router>
      </div>
    );
  }
}

export default App;
