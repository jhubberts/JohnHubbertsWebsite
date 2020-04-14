import React from 'react';
import { Switch, Redirect, Route, BrowserRouter } from 'react-router-dom';

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

function App () {
  const router = (
    <BrowserRouter>
      <Switch>
        <Redirect exact path="/index.html" to="/"/>
        <Route exact path="/" component={HomePage} />
        <Route exact path="/about" component={AboutPage} />
        <Route exact path="/contact" component={ContactPage} />
        <Route exact path="/projects" component={ProjectsPage} />
        <Route exact path="/health" component={SiteHealth} />
        <Route component={NotFound} />
      </Switch>
    </BrowserRouter>
  );

  const navbar = (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand href="/">John Hubberts</Navbar.Brand>
      <Nav className="mr-auto">
      <Nav.Link href="/projects">Projects</Nav.Link>
      <Nav.Link href="/about">About</Nav.Link>
      <Nav.Link href="/contact">Contact</Nav.Link>
    </Nav>
    </Navbar>
  );

  return (
    <div>
      {navbar}
      <Container fluid>
        {router}
      </Container>
    </div>
  );
};

export default App;
