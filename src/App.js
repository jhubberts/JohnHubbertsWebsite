import React from 'react';
import { Switch, Route } from 'react-router-dom';
import './App.css';

import HomePage from "./components/HomePage/HomePage";
import SiteHealth from "./components/SiteHealth/SiteHealth";
import NotFound from "./components/NotFound/NotFound";

const App = () => {
  const router = (
    <Switch>
      <Route exact path="/" component={HomePage} />
      <Route exact path="/health" component={SiteHealth} />
      <Route component={NotFound} />
    </Switch>
  );

  return router;
};

export default App;
