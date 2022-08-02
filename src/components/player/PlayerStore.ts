import { useTitle } from "@vueuse/core";
import { defineStore } from "pinia";
import { CurrentlyPlaying } from "../../@types/CurrentlyPlaying";
import { defaultCurrentlyPlaying, defaultDevice } from "../../@types/Defaults";
import { DevicesResponse } from "../../@types/Device";
import { Player } from "../../@types/Player";
import { instance } from "../../api";
import { syncOfficialSpotifyClient } from "../../helpers/getSpotifyPlayerState";
import { updatePlayerState } from "../../helpers/play";
import { useAuth } from "../../views/auth/AuthStore";

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
      instance()
        .post("me/player/next")
        .then(() => syncOfficialSpotifyClient());
    },

    async getDeviceList() {
      instance()
        .get<DevicesResponse>("me/player/devices")
        .then(({ data }) => {
          const activeDevice = data.devices.find((d) => d.is_active);
          this.devices.list = data.devices;

          if (this.currentlyPlaying.is_playing && activeDevice) {
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
        .put(`me/player/volume?volume_percent=${volume}`)
        .then(() => (this.devices.activeDevice.volume_percent = volume));
    },

    syncPlayerState(state: Spotify.PlaybackState) {
      this.playerState = state;
    },

    getPlayerState(options?: { fullState: boolean }) {
      instance()
        .get<CurrentlyPlaying>(`me/player`)
        .then(({ data }) => {
          if (data) {
            if (options?.fullState) {
              this.currentlyPlaying = data;
            } else {
              this.currentlyPlaying.item = data.item;
              this.currentlyPlaying.progress_ms = data.progress_ms;
              this.currentlyPlaying.timestamp = data.timestamp;
            }
            useTitle(`${data.item?.album.artists[0].name} - ${data.item?.name}`);
          } else {
            useTitle("Beardify");
          }

          if (this.currentFromSDK) {
            useTitle(`${this.currentFromSDK.artists[0].name} - ${this.currentFromSDK.name}`);
          } else {
            useTitle("Beardify");
          }
        })
        .catch(() => {
          useAuth()
            .refresh()
            .finally(() => updatePlayerState());
        });
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
      updatePlayerState();
    },

    updateFromSDK(args: Spotify.Track, position: number) {
      this.currentFromSDK = args;
      this.currentPositionFromSDK = position;
    },
  },
});
