import React from 'react';
import { Link, Switch, Redirect, Route, BrowserRouter } from 'react-router-dom';

import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import './App.scss';

import HomePage from "./components/HomePage/HomePage";
import SiteHealth from "./components/SiteHealth/SiteHealth";
import NotFound from "./components/NotFound/NotFound";
import AboutPage from "./components/AboutPage/AboutPage";
import ContactPage from "./components/ContactPage/ContactPage";
import ProjectsPage from "./components/ProjectsPage/ProjectsPage";
import ChordLibraryPage from "./components/Guitar/ChordLibraryPage/ChordLibraryPage";

function App () {
  const navbar = (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand as={Link} to="/">John Hubberts</Navbar.Brand>
      <Nav className="mr-auto">
      <Nav.Link as={Link} to="/projects">Projects</Nav.Link>
      <Nav.Link as={Link} to="/about">About</Nav.Link>
      <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
    </Nav>
    </Navbar>
  );

  return (
    <BrowserRouter>
      {navbar}

      <Container fluid>
        <Switch>
          <Redirect exact path="/index.html" to="/"/>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/about" component={AboutPage} />
          <Route exact path="/contact" component={ContactPage} />
          <Route exact path="/projects" component={ProjectsPage} />
          <Route exact path="/health" component={SiteHealth} />
          <Route exact path="/guitar" component={ChordLibraryPage} />
          <Route component={NotFound} />
        </Switch>
      </Container>
    </BrowserRouter>
  );
};

export default App;
