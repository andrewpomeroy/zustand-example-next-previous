import { useCallback, useEffect, useRef, useState } from "react";
import usePlayerStore from "../playerStore";
import { MOCK_DURATION } from "../constants";
// import RenderCount from "../components/RenderCount";
import Slider from "../components/Slider";
import { formatAsMinutesSeconds } from "../lib/time-helpers";
import { useShallow } from "zustand/react/shallow";

export const SessionReplayPlayer = () => {
  // NOTE: bad pattern. see the comment above the usePlayerStore definition
  // const {
  //   play,
  //   pause,
  //   playing,
  //   // currentTime,
  //   skipTo,
  //   initialize,
  // } = usePlayerStore()
  const { play, pause, playing, skipTo, previousEvent, nextEvent, initialize } =
    usePlayerStore(
      useShallow((state) => ({
        play: state.play,
        pause: state.pause,
        playing: state.playing,
        skipTo: state.skipTo,
        previousEvent: state.previousEvent,
        nextEvent: state.nextEvent,
        initialize: state.initialize,
      }))
    );

  // This is the most straightforward way I could find to initialize the store,
  // trying to mimic a realistic setting. The key here is, the player alone is responsible for initializing the store.
  // Other consumers can pull state off of the store, etc., but there should be only one initiator
  useEffect(() => {
    initialize({ totalDuration: MOCK_DURATION });
  }, [initialize]);

  const playOrPause = useCallback(() => {
    if (playing) {
      pause();
    } else {
      play();
    }
  }, [pause, play, playing]);
  const currentTimeRef = useRef<number>();
  const [displayTime, setDisplayTime] = useState<string>("00:00");

  // subscribe to store currentTime state
  useEffect(() => {
    const unsubscribe = usePlayerStore.subscribe((state) => {
      // throttle re-renders to every second since the display time does not need to catch all the sub-second updates
      // TODO: handle playbacks less than 1 second long. Reference fix for: https://new-relic.atlassian.net/browse/NR-177300
      if (
        state.currentTime != null &&
        Math.floor(state.currentTime / 1000) !== (currentTimeRef.current ?? 0)
      ) {
        const newTime = Math.floor(state.currentTime / 1000);
        setDisplayTime(formatAsMinutesSeconds(newTime));
        currentTimeRef.current = newTime;
      }
    });
    return () => {
      unsubscribe();
    };
  }, [setDisplayTime]);

  console.log(
    "%c💣️ SessionReplayPlayer render",
    "background: aquamarine; color: steelblue; font-weight: bold"
  );
  return (
    <>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <Slider />
        </div>
        <span>&nbsp;</span>
        <span style={{ fontFamily: "monospace" }}>{displayTime}</span>
      </div>
      <div>
        <button onClick={playOrPause}>{playing ? "Pause" : "Play"}</button>
        <span>&nbsp;</span>
        <button onClick={() => previousEvent()}>⏮️</button>
        <button onClick={() => nextEvent()}>⏭️</button>
        <span>&nbsp;</span>
        <button onClick={() => skipTo(0)}>Skip to 0s</button>
        <button onClick={() => skipTo(10000)}>Skip to 10s</button>
        <button onClick={() => skipTo(MOCK_DURATION)}>Skip to end</button>
      </div>
      <br />
      <div></div>
      <br />
      {/* <div>
        <RenderCount />
      </div> */}
    </>
  );
};

// export default SessionReplayPlayer;
