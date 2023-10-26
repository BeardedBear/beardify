export interface Config {
  bye: boolean;
  scheme: ThemeColor[];
  schemeLabel: SchemeLabel;
  show: boolean;
  theme: ThemeColor[];
  themeLabel: ThemeLabel;
}

export type ThemeLabel = "dark" | "light";
export type SchemeLabel = "apple" | "blue" | "crimson" | "default" | "orange";

export interface ThemeColor {
  color: string;
  var: string;
}

export const schemeDefault: ThemeColor[] = [
  {
    color: "#402d6e",
    var: "--primary-color-darker",
  },
  {
    color: "#543a97",
    var: "--primary-color-dark",
  },
  {
    color: "#9064ff",
    var: "--primary-color",
  },
  {
    color: "#7a50e4",
    var: "--primary-color-light",
  },
  {
    color: "#9064ff",
    var: "--primary-color-lighter",
  },
];
export const schemeBlue: ThemeColor[] = [
  {
    color: "#0285b0",
    var: "--primary-color-darker",
  },
  {
    color: "#0992bf",
    var: "--primary-color-dark",
  },
  {
    color: "#15acde",
    var: "--primary-color",
  },
  {
    color: "#1cbaee",
    var: "--primary-color-light",
  },
  {
    color: "#32ccff",
    var: "--primary-color-lighter",
  },
];
export const schemeApple: ThemeColor[] = [
  {
    color: "#228319",
    var: "--primary-color-darker",
  },
  {
    color: "#228d17",
    var: "--primary-color-dark",
  },
  {
    color: "#28aa1b",
    var: "--primary-color",
  },
  {
    color: "#2dc31e",
    var: "--primary-color-light",
  },
  {
    color: "#3fd830",
    var: "--primary-color-lighter",
  },
];
export const schemeCrimson: ThemeColor[] = [
  {
    color: "#9d152c",
    var: "--primary-color-darker",
  },
  {
    color: "#b51833",
    var: "--primary-color-dark",
  },
  {
    color: "#de1c3e",
    var: "--primary-color",
  },
  {
    color: "#ff4868",
    var: "--primary-color-light",
  },
  {
    color: "#ff647f",
    var: "--primary-color-lighter",
  },
];

export const themeDark: ThemeColor[] = [
  {
    color: "#15181d",
    var: "--bg-color-darker",
  },
  {
    color: "#181b21",
    var: "--bg-color-dark",
  },
  {
    color: "#1b1e26",
    var: "--bg-color",
  },
  {
    color: "#272b36",
    var: "--bg-color-light",
  },
  {
    color: "#323643",
    var: "--bg-color-lighter",
  },
  {
    color: "#929ea8",
    var: "--font-color-dark",
  },
  {
    color: "#b0bac2",
    var: "--font-color",
  },
  {
    color: "#e3e8ec",
    var: "--font-color-light",
  },
];
export const themeLight: ThemeColor[] = [
  {
    color: "#ffffff",
    var: "--bg-color-darker",
  },
  {
    color: "#f3f3f3",
    var: "--bg-color-dark",
  },
  {
    color: "#eaeaea",
    var: "--bg-color",
  },
  {
    color: "#e1e1e1",
    var: "--bg-color-light",
  },
  {
    color: "#d5d5d5",
    var: "--bg-color-lighter",
  },
  {
    color: "#2a2e31",
    var: "--font-color-dark",
  },
  {
    color: "#1b1e20",
    var: "--font-color",
  },
  {
    color: "#0f1113",
    var: "--font-color-light",
  },
];
