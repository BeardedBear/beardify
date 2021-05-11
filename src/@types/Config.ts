export interface Config {
  show: boolean;
  theme: ThemeColor[];
  themeLabel: ThemeLabel;
}

export type ThemeLabel = "light" | "dark";

export interface ThemeColor {
  var: string;
  color: string;
}

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
