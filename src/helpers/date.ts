const timecode = (date: number) => {
  const minutes = new Date(date).getMinutes();
  const seconds = new Date(date).getSeconds();
  return minutes + ":" + (seconds < 10 ? `0${seconds}` : seconds);
};

export { timecode };
