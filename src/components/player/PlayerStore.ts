import { defineStore } from "pinia";
import { defaultCurrentlyPlaying, defaultDevice } from "../../@types/Defaults";
import { DevicesResponse } from "../../@types/Device";
import { Player } from "../../@types/Player";
import { instance } from "../../api";
import spotify from "../../spotify";

export const usePlayer = defineStore("player", {
  state: (): Player => ({
    devices: {
      activeDevice: defaultDevice,
      list: [],
    },
    thisDeviceId: "",
    currentlyPlaying: defaultCurrentlyPlaying,
    currentFromSDK: null,
    currentPositionFromSDK: 0,
    playerState: null,
  }),

  actions: {
    play(): void {
      instance().put("me/player/play", { device_id: this.devices.activeDevice });
    },

    pause(): void {
      instance().put("me/player/pause", { device_id: this.devices.activeDevice });
    },

    next(): void {
      instance().post("me/player/next");
    },

    async getDeviceList() {
      instance()
        .get<DevicesResponse>("me/player/devices")
        .then(({ data }) => {
          const activeDevice = data.devices.find((d) => d.is_active);
          this.devices.list = data.devices;
          if (!data.devices.length) spotify().connect();
          if (!this.playerState?.paused && activeDevice) {
            this.devices.activeDevice = activeDevice;
          } else if (activeDevice?.is_active) {
            this.devices.activeDevice = activeDevice;
          } else {
            this.setDevice(this.thisDeviceId);
          }
        });
    },

    setDevice(deviceId: string | null) {
      instance()
        .put("me/player", { device_ids: [deviceId] })
        .then(() => {
          instance()
            .get<DevicesResponse>("me/player/devices")
            .then(({ data }) => {
              this.devices.list = data.devices;
              const activeDevice = data.devices.find((d) => d.id === deviceId);
              if (activeDevice) this.devices.activeDevice = activeDevice;
            });
        });
    },

    setVolume(volume: number) {
      instance()
        .put(`me/player/volume?volume_percent=${Math.round(Math.expm1(volume / 100) * 0.582 * 100)}`)
        .then(() => (this.devices.activeDevice.volume_percent = volume));
    },

    syncPlayerState(state: Spotify.PlaybackState) {
      this.playerState = state;
    },

    toggleShuffle() {
      if (this.currentlyPlaying.shuffle_state) {
        instance()
          .put("me/player/shuffle?state=false")
          .then(() => (this.currentlyPlaying.shuffle_state = false));
      } else {
        instance()
          .put("me/player/shuffle?state=true")
          .then(() => (this.currentlyPlaying.shuffle_state = true));
      }
    },

    toggleRepeat() {
      if (this.currentlyPlaying.repeat_state === "off") {
        instance()
          .put("me/player/repeat?state=context")
          .then(() => (this.currentlyPlaying.repeat_state = "context"));
      } else {
        instance()
          .put("me/player/repeat?state=off")
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

    updateFromSDK(args: Spotify.Track, position: number) {
      this.currentFromSDK = args;
      this.currentPositionFromSDK = position;
    },
  },
});
