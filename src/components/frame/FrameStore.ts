import { defineStore } from "pinia";

import { Frame } from "@/@types/Frame";

export const useFrame = defineStore("frame", {
  actions: {
    close() {
      this.isClosing = true;
      setTimeout(() => {
        this.url = "";
        this.show = false;
        this.isClosing = false;
        this.isMinimized = false;
      }, 200);
    },

    minimize() {
      this.isMinimized = true;
    },

    open(url: string, siteName?: string) {
      this.show = true;
      this.url = url;
      this.isMinimized = false;
      if (siteName) this.siteName = siteName;
    },

    restore() {
      this.isMinimized = false;
    },
  },

  state: (): Frame => ({
    isClosing: false,
    isMinimized: false,
    show: false,
    siteName: "",
    url: "",
  }),
});
