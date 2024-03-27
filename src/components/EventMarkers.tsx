import React, { useEffect, useRef, useState } from "react";
import usePlayerStore from "../playerStore";
import { MOCK_DURATION } from "../constants";
import { useDebounce } from "react-use";
import { useShallow } from "zustand/react/shallow";

const EventMarkers = () => {
  // const { events } = usePlayerStore(state => state.events);
  const { events, totalDuration } = usePlayerStore(
    useShallow((state) => ({
      events: state.events,
      totalDuration: state.totalDuration,
    }))
  );

  return (
    <div className="EventMarkers">
      {events.map((event, index) => (
        <div
          key={index}
          className="EventMarkers-marker"
          style={{
            left: `calc(${
              (event.timestamp / totalDuration) * 100
            }% + (var(--range-thumb-size) / 2))`,
          }}
        />
      ))}
    </div>
  );
};

export default EventMarkers;
