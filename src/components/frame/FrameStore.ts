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
      }, 200);
    },

    open(url: string, siteName?: string) {
      this.show = true;
      this.url = url;
      if (siteName) this.siteName = siteName;
    },
  },

  state: (): Frame => ({
    isClosing: false,
    show: false,
    siteName: "",
    url: "",
  }),
});
