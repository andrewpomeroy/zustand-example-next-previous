import React, { useEffect, useRef, useState } from "react";
import usePlayerStore from "../playerStore";
import { MOCK_DURATION } from "../constants";
import { useDebounce } from "react-use";

const Slider = () => {
  const ref = useRef<HTMLInputElement>();
  const { skipTo } = usePlayerStore();
  const [localVal, setLocalVal] = useState<number>();

  useEffect(() => {
    const unsubscribe = usePlayerStore.subscribe((state) => {
      // This is me being sneaky to avoid re-renders
      // We could do something like this when we rebuild the Slider
      if (ref.current) ref.current.value = String(state.currentTime) ?? 0;
      setLocalVal(state.currentTime);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useDebounce(
    () => {
      if (localVal != null) skipTo(localVal);
    },
    50,
    [localVal]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setLocalVal(Number(e.target.value));

  return (
    <input
      type="range"
      onChange={handleInputChange}
      value={localVal ?? 0}
      ref={ref}
      min={0}
      max={MOCK_DURATION}
    />
  );
};

export default Slider;
