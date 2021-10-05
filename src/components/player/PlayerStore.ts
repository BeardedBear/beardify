import { defineStore } from "pinia";
import { CurrentlyPlaying } from "../../@types/CurrentlyPlaying";
import { defaultCurrentlyPlaying, defaultDevice } from "../../@types/Defaults";
import { Device, DevicesResponse } from "../../@types/Device";
import { Player } from "../../@types/Player";
import { api, instance } from "../../api";
import router from "../../router";

export const usePlayer = defineStore("player", {
  state: (): Player => ({
    devices: {
      activeDevice: defaultDevice,
      list: [],
    },
    thisDeviceId: "",
    currentlyPlaying: defaultCurrentlyPlaying,
  }),

  actions: {
    getDeviceList() {
      instance()
        .get<DevicesResponse>("me/player/devices")
        .then(({ data }) => (this.devices.list = data.devices));
    },

    setDevice(device: Device) {
      this.devices.activeDevice = device;
      instance().put("me/player", { device_ids: [device.id] });
    },

    setVolume(volume: number) {
      instance()
        .put(`me/player/volume?volume_percent=${volume}`)
        .then(() => (this.devices.activeDevice.volume_percent = volume));
    },

    getPlayerState(customEvent?: CurrentlyPlaying) {
      instance()
        .get(`me/player`)
        .then((e) => {
          if (e.status === 401) router.push("login");
          if (customEvent) this.devices.activeDevice = customEvent.device;
          this.currentlyPlaying = e.data;
        })
        .catch((e) => console.error(e));
    },

    toggleShuffle() {
      if (this.currentlyPlaying.shuffle_state) {
        instance().put(`${api.url}me/player/shuffle?state=false`);
      } else {
        instance().put(`${api.url}me/player/shuffle?state=true`);
      }
    },

    toggleRepeat() {
      if (this.currentlyPlaying.repeat_state === "off") {
        instance().put(`${api.url}me/player/repeat?state=context`);
      } else {
        instance().put(`${api.url}me/player/repeat?state=off`);
      }
    },

    updateProgress(progress: number) {
      this.currentlyPlaying.progress_ms = progress;
    },

    thisDevice(deviceId: string) {
      this.thisDeviceId = deviceId;
    },
  },
});
