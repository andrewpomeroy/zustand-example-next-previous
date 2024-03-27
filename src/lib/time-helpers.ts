export const formatAsMinutesSeconds = (timeElapsed: number) => {
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;
  return `${minutes < 10 ? "0" : ""}${minutes}:${
    seconds < 10 ? "0" : ""
  }${seconds}`;
};
