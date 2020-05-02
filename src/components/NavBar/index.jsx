import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar'
import { Link } from 'react-router-dom';

import './NavBar.scss';

const NavBar = (props) => {
  return (
    <div className="navbar">
      <AppBar elevation={0} position='static' {...props}>
        <Toolbar>
          <div className="navbarLeftSection"></div>
          <div className="navbarMidSection">
            <Link className="navbarLink" to="/"><h2 className="navbarTitle">John Hubberts</h2></Link>
          </div>
          <div className="navbarRightSection"></div>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default NavBar;