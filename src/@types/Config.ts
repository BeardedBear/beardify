export interface Config {
  bye: boolean;
  show: boolean;
  theme: ThemeColor[];
  themeLabel: ThemeLabel;
  scheme: ThemeColor[];
  schemeLabel: SchemeLabel;
}

export type ThemeLabel = "light" | "dark";
export type SchemeLabel = "default" | "blue" | "crimson" | "apple" | "orange";

export interface ThemeColor {
  var: string;
  color: string;
}

export const schemeDefault: ThemeColor[] = [
  {
    var: "--primary-color-darker",
    color: "#402d6e",
  },
  {
    var: "--primary-color-dark",
    color: "#543a97",
  },
  {
    var: "--primary-color",
    color: "#9064ff",
  },
  {
    var: "--primary-color-light",
    color: "#7a50e4",
  },
  {
    var: "--primary-color-lighter",
    color: "#9064ff",
  },
];
export const schemeBlue: ThemeColor[] = [
  {
    var: "--primary-color-darker",
    color: "#0285b0",
  },
  {
    var: "--primary-color-dark",
    color: "#0992bf",
  },
  {
    var: "--primary-color",
    color: "#15acde",
  },
  {
    var: "--primary-color-light",
    color: "#1cbaee",
  },
  {
    var: "--primary-color-lighter",
    color: "#32ccff",
  },
];
export const schemeApple: ThemeColor[] = [
  {
    var: "--primary-color-darker",
    color: "#228319",
  },
  {
    var: "--primary-color-dark",
    color: "#228d17",
  },
  {
    var: "--primary-color",
    color: "#28aa1b",
  },
  {
    var: "--primary-color-light",
    color: "#2dc31e",
  },
  {
    var: "--primary-color-lighter",
    color: "#3fd830",
  },
];
export const schemeCrimson: ThemeColor[] = [
  {
    var: "--primary-color-darker",
    color: "#9d152c",
  },
  {
    var: "--primary-color-dark",
    color: "#b51833",
  },
  {
    var: "--primary-color",
    color: "#de1c3e",
  },
  {
    var: "--primary-color-light",
    color: "#ff4868",
  },
  {
    var: "--primary-color-lighter",
    color: "#ff647f",
  },
];

export const themeDark: ThemeColor[] = [
  {
    var: "--bg-color-darker",
    color: "#15181d",
  },
  {
    var: "--bg-color-dark",
    color: "#181b21",
  },
  {
    var: "--bg-color",
    color: "#1b1e26",
  },
  {
    var: "--bg-color-light",
    color: "#21242e",
  },
  {
    var: "--bg-color-lighter",
    color: "#272a35",
  },
  {
    var: "--font-color",
    color: "#d5dbe0",
  },
];
export const themeLight: ThemeColor[] = [
  {
    var: "--bg-color-darker",
    color: "#ebebeb",
  },
  {
    var: "--bg-color-dark",
    color: "#dedede",
  },
  {
    var: "--bg-color",
    color: "#d5d5d5",
  },
  {
    var: "--bg-color-light",
    color: "#eaeaea",
  },
  {
    var: "--bg-color-lighter",
    color: "#ffffff",
  },
  {
    var: "--font-color",
    color: "#1b1e20",
  },
];
