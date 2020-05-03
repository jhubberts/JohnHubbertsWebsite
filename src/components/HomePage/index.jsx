import React from 'react';
import {Link} from "react-router-dom";

const HomePage = () => {
  return (
    <div>
      <h1>What Am I Working On Currently?</h1>
      <ul>
        <li><Link to="/guitar/chordLibrary"><h2>Guitar Voicing Fingering Visualizer</h2></Link></li>
        <li><Link to="/guitar/dijkstras"><h2>Dijkstra's Algorithm Solver for Chord Voicing Movement</h2></Link></li>
      </ul>
    </div>
  )
};

export default HomePage;