import { StateCreator, create } from "zustand";
import { EventTrailError, EventTrailPageEvent } from "./components/EventTrail";
import { MOCK_EVENTS } from "./constants";

type PlayerInternalsStore = {
  playing: boolean;
  currentTime: number;
  startTime: number;
  totalDuration: number;
  play: () => void;
  pause: () => void;
  animateFrameId: number;
  animate: (time: number) => void;
  tick: (frameTime: number) => void;
  skipTo: (time: number) => void;
  previousEvent: () => void;
  nextEvent: () => void;
};

export const LoadingState = {
  IDLE: "IDLE",
  LOADING: "LOADING",
  DONE: "DONE",
} as const;

// !! Don't read too much into the specifics of the "internals" slice!
// I just wrote this to as a means of easily replicating an interruptible, skippable timer like the one rrweb provides us
const createPlayerInteralsSlice: StateCreator<
  ReplayStore,
  [],
  [],
  PlayerInternalsStore
> = (set, get) => ({
  playing: false,
  currentTime: 0,
  startTime: 0,
  totalDuration: 0,
  play: () => {
    const { playing, currentTime, totalDuration, skipTo } = get();
    if (!playing) {
      const atEnd = currentTime === totalDuration;
      set({ playing: true, startTime: performance.now() - currentTime });
      if (atEnd) skipTo(0);
      get().animate(performance.now());
    }
  },
  pause: () => {
    if (get().playing) {
      get().tick(performance.now()); // Update currentTime before pausing
      set({ playing: false });
    }
  },
  tick: (frameTime: number) => {
    const { startTime, totalDuration } = get();
    let currentTime = frameTime - startTime;
    if (currentTime >= totalDuration) {
      currentTime = totalDuration;
      set({ playing: false });
    }
    set({ currentTime });
  },
  animateFrameId: 0,
  animate: (time: number) => {
    get().tick(performance.now());
    if (get().playing) {
      get().animateFrameId = requestAnimationFrame(get().animate);
    } else {
      cancelAnimationFrame(get().animateFrameId);
    }
  },
  skipTo: (time: number) => {
    const { totalDuration } = get();
    const clampedTime = Math.min(Math.max(time, 0), totalDuration);
    set({ currentTime: clampedTime });
    // If the video is playing, adjust the startTime to keep the animation smooth
    if (get().playing) {
      set({ startTime: performance.now() - clampedTime });
    }
  },
  previousEvent: () => {
    const { events, currentTime, skipTo } = get();
    const currentEventIndex = events.reduce(
      (acc, event, index) => (event.timestamp <= currentTime ? index : acc),
      -1
    );
    if (currentEventIndex !== -1) {
      const previousEvent = events[currentEventIndex];
      if (previousEvent) {
        skipTo(previousEvent.timestamp);
      }
    }
  },
  nextEvent: () => {
    const { events, currentTime, skipTo } = get();
    const currentEventIndex = events.reduce(
      (acc, event, index) => (event.timestamp <= currentTime ? index : acc),
      -1
    );

    if (currentEventIndex !== -1) {
      const nextEvent = events[currentEventIndex + 1];
      if (nextEvent) {
        skipTo(nextEvent.timestamp);
      }
    }
  },
});

type PlayerDataStore = {};

type PlayerStore = {
  loadingState: (typeof LoadingState)[keyof typeof LoadingState];
  setLoadingState: (
    newState: (typeof LoadingState)[keyof typeof LoadingState]
  ) => void;
  initialize: (arg0: { totalDuration: number }) => void;
};

const createPlayerSlice: StateCreator<ReplayStore, [], [], PlayerStore> = (
  set,
  get
) => ({
  loadingState: LoadingState.IDLE,
  setLoadingState: (newState) => set(() => ({ loadingState: newState })),
  // This could just as easily be scrapped for a different pattern
  // Just wanted to show an example of a method that the outer context can call (like, an on-initial-load handler) to set the "minimium viable state"
  initialize: ({ totalDuration }) => {
    usePlayerStore.setState({
      currentTime: 0,
      totalDuration,
    });
    get().setLoadingState(LoadingState.DONE);
  },
});

type FocusedEventTrailItem = EventTrailPageEvent | EventTrailError;

type EventTrailStoreSlice = {
  // The focused-item property perhaps should not be scoped to the event trail,
  // it's more global in reality, since we want to produce the same behavior
  // (shifting the "global" timeline across all SR modules) when clicking on
  // waterfall item timestamps as well.
  events: (EventTrailPageEvent | EventTrailError)[];
  // setEvents: (events: (EventTrailPageEvent | EventTrailError)[]) => void;
  // eventsLoadingState: (typeof LoadingState)[keyof typeof LoadingState];
  // setEventsLoadingState: (
  //   eventsLoadingState: (typeof LoadingState)[keyof typeof LoadingState]
  // ) => void;
  focusedEventTrailItem: EventTrailPageEvent | EventTrailError | null;
  setFocusedEventTrailItem: (item: FocusedEventTrailItem | null) => void;
  onGoToEventTrailItem: (
    event: React.MouseEvent | React.KeyboardEvent,
    { item }: { item: FocusedEventTrailItem }
  ) => void;
  onClickErrorsInboxLink: (
    event: React.MouseEvent | React.KeyboardEvent,
    { url }: { url: string }
  ) => void;
};
export const createEventTrailSlice: StateCreator<
  ReplayStore,
  [],
  [],
  EventTrailStoreSlice
> = (set, get) => ({
  events: MOCK_EVENTS,
  // setEvents: (events) => set(() => ({ events })),
  // eventsLoadingState: LoadingState.IDLE,
  // setEventsLoadingState: (eventsLoadingState) =>
  //   set({
  //     eventsLoadingState,
  //   }),
  focusedEventTrailItem: null,
  setFocusedEventTrailItem: (item) =>
    set(() => ({ focusedEventTrailItem: item })),
  onGoToEventTrailItem: (event, { item }) => {
    get().setFocusedEventTrailItem(item);
    get().skipTo(item.timestamp);
  },
  onClickErrorsInboxLink: (event, { url }) => {
    get().pause();
    window.open("https://google.com", "_blank");
  },
});

type ReplayStore = PlayerInternalsStore & PlayerStore & EventTrailStoreSlice;

export const usePlayerStore = create<ReplayStore>()((...args) => {
  return {
    ...createPlayerInteralsSlice(...args),
    ...createPlayerSlice(...args),
    ...createEventTrailSlice(...args),
  };
});

export default usePlayerStore;
