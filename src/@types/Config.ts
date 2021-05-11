export interface Config {
  show: boolean;
  theme: ThemeColor[];
  themeLabel: ThemeLabel;
  scheme: ThemeColor[];
  schemeLabel: SchemeLabel;
}

export type ThemeLabel = "light" | "dark";
export type SchemeLabel = "default" | "blue";

export interface ThemeColor {
  var: string;
  color: string;
}

export const schemeDefault: ThemeColor[] = [
  {
    var: "--primary-color-darker",
    color: "#402d6e"
  },
  {
    var: "--primary-color-dark",
    color: "#543a97"
  },
  {
    var: "--primary-color",
    color: "#6d49c9"
  },
  {
    var: "--primary-color-light",
    color: "#7a50e4"
  },
  {
    var: "--primary-color-lighter",
    color: "#9064ff"
  }
];
export const schemeBlue: ThemeColor[] = [
  {
    var: "--primary-color-darker",
    color: "#25688d"
  },
  {
    var: "--primary-color-dark",
    color: "#3482ad"
  },
  {
    var: "--primary-color",
    color: "#499dc9"
  },
  {
    var: "--primary-color-light",
    color: "#47aee4"
  },
  {
    var: "--primary-color-lighter",
    color: "#42beff"
  }
];

export const themeDark: ThemeColor[] = [
  {
    var: "--bg-color-darker",
    color: "#15181d"
  },
  {
    var: "--bg-color-dark",
    color: "#181b21"
  },
  {
    var: "--bg-color",
    color: "#1b1e26"
  },
  {
    var: "--bg-color-light",
    color: "#21242e"
  },
  {
    var: "--bg-color-lighter",
    color: "#272c3a"
  },
  {
    var: "--font-color",
    color: "#d5dbe0"
  }
];
export const themeLight: ThemeColor[] = [
  {
    var: "--bg-color-darker",
    color: "#ebebeb"
  },
  {
    var: "--bg-color-dark",
    color: "#dedede"
  },
  {
    var: "--bg-color",
    color: "#d5d5d5"
  },
  {
    var: "--bg-color-light",
    color: "#eaeaea"
  },
  {
    var: "--bg-color-lighter",
    color: "#ffffff"
  },
  {
    var: "--font-color",
    color: "#1b1e20"
  }
];
