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
    play(): void {
      instance()
        .put("me/player/play", { device_id: this.devices.activeDevice })
        .then(() => (this.currentlyPlaying.is_playing = true));
    },

    pause(): void {
      instance()
        .put("me/player/pause", { device_id: this.devices.activeDevice })
        .then(() => (this.currentlyPlaying.is_playing = false));
    },

    next(): void {
      instance().post("me/player/next");
    },

    getDeviceList() {
      instance()
        .get<DevicesResponse>("me/player/devices")
        .then(({ data }) => {
          const activeDevice = data.devices.find((d) => d.is_active);
          this.devices.list = data.devices;

          if (activeDevice) this.devices.activeDevice = activeDevice;
          if (this.devices.list.length === 1 && !this.currentlyPlaying.is_playing) {
            this.setDevice(this.devices.list[0]);
          }
        });
    },

    setDevice(device: Device) {
      instance()
        .put("me/player", { device_ids: [device.id] })
        .then(() => (this.devices.activeDevice = device));
    },

    setVolume(volume: number) {
      instance()
        .put(`me/player/volume?volume_percent=${volume}`)
        .then(() => (this.devices.activeDevice.volume_percent = volume));
    },

    getPlayerState() {
      instance()
        .get<CurrentlyPlaying>(`me/player`)
        .then((e) => {
          this.currentlyPlaying = e.data;
          this.getDeviceList();
        });
    },

    toggleShuffle() {
      if (this.currentlyPlaying.shuffle_state) {
        instance()
          .put(`${api.url}me/player/shuffle?state=false`)
          .then(() => (this.currentlyPlaying.shuffle_state = false));
      } else {
        instance()
          .put(`${api.url}me/player/shuffle?state=true`)
          .then(() => (this.currentlyPlaying.shuffle_state = true));
      }
    },

    toggleRepeat() {
      if (this.currentlyPlaying.repeat_state === "off") {
        instance()
          .put(`${api.url}me/player/repeat?state=context`)
          .then(() => (this.currentlyPlaying.repeat_state = "context"));
      } else {
        instance()
          .put(`${api.url}me/player/repeat?state=off`)
          .then(() => (this.currentlyPlaying.repeat_state = "off"));
      }
    },

    seek(progress: number) {
      instance()
        .put(`me/player/seek?position_ms=${Math.round(progress)}`)
        .then(() => (this.currentlyPlaying.progress_ms = progress));
    },

    thisDevice(deviceId: string) {
      this.thisDeviceId = deviceId;
      this.getDeviceList();
    },
  },
});
