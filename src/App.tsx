import * as React from "react";
import "./App.css";
import "./range.css";
import { SessionReplayPlayer } from "./shared-component-session-replay-player/SessionReplayPlayer";
// import EventTrail from "./components/EventTrail";

export default function App() {
  return (
    <div className="Layout">
      {/* <h1>Session-replay nerdlet</h1> */}
      <div className="MainRow">
        <div className="MainRow-item MainRow-item--player">
          <h2>Player</h2>
          <SessionReplayPlayer />
        </div>
        {/* <div className="MainRow-item MainRow-item--eventTrail">
          <h2>Event Trail</h2>
          <EventTrail />
        </div> */}
      </div>
      {/* <div className="WaterfallContainer">
        <h2>Waterfall</h2>
      </div> */}
    </div>
  );
}
