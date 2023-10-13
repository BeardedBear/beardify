import { defineStore } from "pinia";
import { Frame } from "../../@types/Frame";

export const useFrame = defineStore("frame", {
  state: (): Frame => ({
    show: false,
    isClosing: false,
    url: "",
    siteName: "",
  }),

  actions: {
    open(url: string, siteName?: string) {
      this.show = true;
      this.url = url;
      if (siteName) this.siteName = siteName;
    },

    close() {
      this.isClosing = true;
      setTimeout(() => {
        this.url = "";
        this.show = false;
        this.isClosing = false;
      }, 200);
    },
  },
});
