// https://date-fns.org/v2.27.0/docs/format

import format from "date-fns/format";
import { fr } from "date-fns/locale";
import formatDuration from "date-fns/formatDuration";

const options = { locale: fr };

export function timecode(date: number | null | undefined): string {
  if (date) {
    const hours = new Date(date).getHours() - 1;
    if (hours > 0) {
      return format(new Date(date), `${hours}:mm:ss`, options);
    }
    return format(new Date(date), "m:ss", options);
  }
  return "";
}

export function timecodeWithUnits(date: number): string {
  const hours = new Date(date).getHours() - 1;
  const minutes = new Date(date).getMinutes();
  const seconds = new Date(date).getSeconds();

  return formatDuration({ hours, minutes, seconds }, options);
}

export function date(date: string | number): string {
  return format(new Date(date), "d MMM y", options);
}
