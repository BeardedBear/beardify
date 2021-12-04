// https://date-fns.org/v2.27.0/docs/format

import format from "date-fns/format";
import { fr } from "date-fns/locale";

const options = { locale: fr };

export function timecode(date: number): string {
  return format(new Date(date), "m:ss", options);
}

export function timecodeWithUnits(date: number): string {
  return format(new Date(date), "k:m:ss", options);
}

export function date(date: string | number): string {
  return format(new Date(date), "d MMM y", options);
}
