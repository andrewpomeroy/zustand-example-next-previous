import React, { useEffect, useRef, useState } from "react";
import usePlayerStore from "../playerStore";
import { MOCK_DURATION } from "../constants";
import { useDebounce } from "react-use";

const Slider = () => {
  const ref = useRef<HTMLInputElement>();
  const { skipTo } = usePlayerStore();
  const [localVal, setLocalVal] = useState<number>();
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const unsubscribe = usePlayerStore.subscribe((state) => {
      // This is me being sneaky to avoid re-renders
      // We could do something like this when we rebuild the Slider
      // if (ref.current) ref.current.value = String(state.currentTime) ?? 0;
      // console.log(
      //   "%c💣️ dragging",
      //   "background: aliceblue; color: dodgerblue; font-weight: bold",
      //   dragging
      // );
      if (!dragging && ref.current)
        ref.current.value = String(state.currentTime) ?? 0;
      // setLocalVal(state.currentTime);
    });
    return () => {
      unsubscribe();
    };
  }, [dragging]);

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
      // value={dragging ?? 0}
      // onChange={handleInputChange}
      // onDragStart={() => {
      //   console.log(
      //     "%c💣️ setting dragging",
      //     "background: aliceblue; color: dodgerblue; font-weight: bold"
      //   );
      //   setDragging(true);
      // }}
      onMouseDown={() => {
        console.log(
          "%c💣️ dragging ON",
          "background: aliceblue; color: dodgerblue; font-weight: bold"
        );
        setDragging(true);
      }}
      onMouseUp={(event: React.MouseEvent<HTMLInputElement>) => {
        const eventTarget = event.target as HTMLInputElement;
        console.log(
          "%c💣️ dragging OFF",
          "background: aliceblue; color: dodgerblue; font-weight: bold"
        );
        skipTo(Number(eventTarget.value));
        setDragging(false);
      }}
      // onInput={(event: React.MouseEvent<HTMLInputElement>) => {
      //   console.log(
      //     "%c💣️ input",
      //     "background: aliceblue; color: dodgerblue; font-weight: bold",
      //     event.target?.value
      //   );
      // }}
      // onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
      //   console.log(
      //     "%c💣️ change",
      //     "background: aliceblue; color: dodgerblue; font-weight: bold",
      //     event.target?.value
      //   );
      // }}
      // onDragEnd={(event: React.MouseEvent<HTMLInputElement>) => {
      //   console.log(
      //     "%c💣️ event.target?.value",
      //     "background: aliceblue; color: dodgerblue; font-weight: bold",
      //     event.target?.value
      //   );
      //   skipTo(event.target?.value!);
      //   setDragging(false);
      // }}
      ref={ref}
      min={0}
      max={MOCK_DURATION}
      className="Slider-input"
    />
  );
};

export default Slider;
