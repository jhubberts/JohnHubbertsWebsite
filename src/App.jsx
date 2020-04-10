import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import './App.scss';

import HomePage from "./components/HomePage/HomePage";
import SiteHealth from "./components/SiteHealth/SiteHealth";
import NotFound from "./components/NotFound/NotFound";

function App () {
  const router = (
    <Switch>
      <Route exact path="/" component={HomePage} />
      <Route exact path="/health" component={SiteHealth} />
      <Route component={NotFound} />
    </Switch>
  );

  const navbar = (
    <Navbar bg="dark" expand="lg">
      <Navbar.Brand href="/">John Hubberts</Navbar.Brand>
    </Navbar>
  );

  return (
    <div>
      {navbar}
      {router}
    </div>
  );
};

export default App;
