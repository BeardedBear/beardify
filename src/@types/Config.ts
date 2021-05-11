export interface Config {
  theme: Theme;
}

export type Theme = "light" | "dark";

export interface Test {
  var: string;
  color: string;
}

export const themeDark: Test[] = [
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
    color: "#212530"
  },
  {
    var: "--bg-color-lighter",
    color: "#272c3a"
  }
];
export const themeLight: Test[] = [
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
  }
];

// document.documentElement.style.setProperty('--bg-color', '#FF0000');

// --bg-color-darker: #15181d;
// --bg-color-dark: #181b21;
// --bg-color: #1b1e26;
// --bg-color-light: #212530;
// --bg-color-lighter: #272c3a;
