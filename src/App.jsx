import React from 'react';
import { Link, Switch, Redirect, Route, BrowserRouter } from 'react-router-dom';

import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar';
import './App.scss';

import HomePage from "./components/HomePage/HomePage";
import SiteHealth from "./components/SiteHealth/SiteHealth";
import NotFound from "./components/NotFound/NotFound";
import ChordLibraryPage from "./components/Guitar/ChordLibraryPage/ChordLibraryPage";

function App () {
  const navbar = (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand as={Link} to="/">John Hubberts</Navbar.Brand>
    </Navbar>
  );

  return (
    <BrowserRouter>
      {navbar}

      <Container fluid>
        <Switch>
          <Redirect exact path="/index.html" to="/"/>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/health" component={SiteHealth} />
          <Route exact path="/guitar/voicings" component={ChordLibraryPage} />
          <Route component={NotFound} />
        </Switch>
      </Container>
    </BrowserRouter>
  );
};

export default App;
