import React from 'react';
import { Switch, Redirect, Route, BrowserRouter } from 'react-router-dom';

import './App.scss';

import HomePage from "./components/HomePage/HomePage";
import SiteHealth from "./components/SiteHealth/SiteHealth";
import NotFound from "./components/NotFound/NotFound";
import ChordLibraryPage from "./components/Guitar/ChordLibraryPage/ChordLibraryPage";

function App () {
  return (
    <BrowserRouter>
      <Switch>
        <Redirect exact path="/index.html" to="/"/>
        <Route exact path="/" component={HomePage} />
        <Route exact path="/health" component={SiteHealth} />
        <Route exact path="/guitar/voicings" component={ChordLibraryPage} />
        <Route component={NotFound} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
