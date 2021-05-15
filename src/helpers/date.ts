export function timecode(date: number): string {
  const minutes = new Date(date).getMinutes();
  const seconds = new Date(date).getSeconds();
  return minutes + ":" + (seconds < 10 ? `0${seconds}` : seconds);
}

export function timecodeWithUnits(date: number): string {
  const hours = new Date(date).getHours();
  const minutes = new Date(date).getMinutes();
  const seconds = new Date(date).getSeconds();

  return (hours > 1 ? hours - 1 + "h " : "") + minutes + "m " + (seconds < 10 ? `0${seconds}` : seconds) + "s";
}
