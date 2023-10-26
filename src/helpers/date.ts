// https://date-fns.org/v2.27.0/docs/format

import format from "date-fns/format";
import formatDuration from "date-fns/formatDuration";
import { enUS } from "date-fns/locale";

const options = { locale: enUS };

export function timecode(date: null | number | undefined): string {
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

export function date(date: number | string): string {
  return format(new Date(date), "d MMM y", options);
}
