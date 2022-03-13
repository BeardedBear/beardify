import { defineStore } from "pinia";
import {
  Config,
  schemeApple,
  schemeBlue,
  schemeCrimson,
  schemeDefault,
  SchemeLabel,
  ThemeColor,
  themeDark,
  ThemeLabel,
  themeLight,
} from "../../@types/Config";

export const useConfig = defineStore("config", {
  state: (): Config => ({
    bye: false,
    show: false,
    theme: themeDark,
    themeLabel: "dark",
    scheme: schemeDefault,
    schemeLabel: "default",
  }),

  actions: {
    switchTheme(themeLabel: ThemeLabel) {
      this.themeLabel = themeLabel;
      this.theme = themeLabel === "light" ? themeLight : themeDark;
      this.theme.forEach((c: ThemeColor) => document.documentElement.style.setProperty(c.var, c.color));
    },

    switchScheme(schemeLabel: SchemeLabel) {
      this.schemeLabel = schemeLabel;
      switch (schemeLabel) {
        case "apple":
          this.scheme = schemeApple;
          break;
        case "blue":
          this.scheme = schemeBlue;
          break;
        case "crimson":
          this.scheme = schemeCrimson;
          break;
        default:
          this.scheme = schemeDefault;
      }
      this.scheme.forEach((c: ThemeColor) => document.documentElement.style.setProperty(c.var, c.color));
    },

    open() {
      this.show = true;
    },

    close() {
      this.bye = true;
      setTimeout(() => {
        this.show = false;
        this.bye = false;
      }, 200);
    },
  },
  persist: {
    key: "beardify-config",
  },
});
