import React from 'react';
import { Switch, Redirect, Route, BrowserRouter } from 'react-router-dom';

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles'
import blue from '@material-ui/core/colors/blue'

import './App.scss';

import NavBar from "./components/NavBar";
import HomePage from "./components/HomePage";
import SiteHealth from "./components/SiteHealth";
import NotFound from "./components/NotFound";
import ChordLibraryPage from "./components/Guitar/ChordLibraryPage/ChordLibraryPage";

function App () {
  const theme = createMuiTheme({
    palette: {
      primary: { light: blue[500], main: blue[700], dark: blue[900] }
    }
  });

  return (
    <BrowserRouter>
      <div className="appBody">
        <ThemeProvider theme={theme}>
          <NavBar></NavBar>
          <Switch>
            <Redirect exact path="/index.html" to="/"/>
            <Route exact path="/" component={HomePage} />
            <Route exact path="/health" component={SiteHealth} />
            <Route exact path="/guitar/voicings" component={ChordLibraryPage} />
            <Route component={NotFound} />
          </Switch>
        </ThemeProvider>
      </div>
    </BrowserRouter>
  );
};

export default App;
