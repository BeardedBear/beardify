import { defineStore } from "pinia";
import { CurrentlyPlaying } from "../../@types/CurrentlyPlaying";
import { defaultCurrentlyPlaying, defaultDevice } from "../../@types/Defaults";
import { Device, DevicesResponse } from "../../@types/Device";
import { Player } from "../../@types/Player";
import { api, instance } from "../../api";

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
        .then(({ data }) => {
          this.devices.list = data.devices;
          if (data.devices.length === 1) this.setDevice(data.devices[0]);
        });
    },

    setDevice(device: Device) {
      this.devices.activeDevice = device;
      instance().put("me/player", { device_ids: [device.id] });
    },

    setVolume(volume: number) {
      this.devices.activeDevice.volume_percent = volume;
      instance().put(`me/player/volume?volume_percent=${volume}`);
    },

    getPlayerState() {
      instance()
        .get<CurrentlyPlaying>(`me/player`)
        .then((e) => {
          if (!this.devices.activeDevice.is_active) this.setDevice(e.data.device);
          this.currentlyPlaying = e.data;
        });
    },

    toggleShuffle() {
      if (this.currentlyPlaying.shuffle_state) {
        this.currentlyPlaying.shuffle_state = false;
        instance().put(`${api.url}me/player/shuffle?state=false`);
      } else {
        this.currentlyPlaying.shuffle_state = true;
        instance().put(`${api.url}me/player/shuffle?state=true`);
      }
    },

    toggleRepeat() {
      if (this.currentlyPlaying.repeat_state === "off") {
        this.currentlyPlaying.repeat_state = "context";
        instance().put(`${api.url}me/player/repeat?state=context`);
      } else {
        this.currentlyPlaying.repeat_state = "off";
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
