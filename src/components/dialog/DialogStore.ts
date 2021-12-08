import { defineStore } from "pinia";
import { Dialog, DialogType } from "../../@types/Dialog";

export const useDialog = defineStore("dialog", {
  state: (): Dialog => ({
    show: false,
    type: null,
    isClosing: false,
  }),

  actions: {
    open(data: { type: DialogType; albumId?: string; playlistId?: string; songUri?: string }) {
      this.show = true;
      this.type = data.type;
      if (data.albumId) this.albumId = data.albumId;
      if (data.playlistId) this.playlistId = data.playlistId;
      if (data.songUri) this.songUri = data.songUri;
    },

    close() {
      this.isClosing = true;
      setTimeout(() => {
        this.show = false;
        this.isClosing = false;
      }, 200);
    },
  },
});
