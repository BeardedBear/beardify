import { defineStore } from "pinia";

import { CurrentlyPlaying } from "../../@types/CurrentlyPlaying";
import { defaultCurrentlyPlaying, defaultDevice } from "../../@types/Defaults";
import { DevicesResponse } from "../../@types/Device";
import { NotificationType } from "../../@types/Notification";
import { defaultPlaybackState, Player } from "../../@types/Player";
import { Track } from "../../@types/Track";
import { instance } from "../../api";
import { notification } from "../../helpers/notifications";
import spotify from "../../spotify";
import { useNotification } from "../notification/NotificationStore";

export const usePlayer = defineStore("player", {
  actions: {
    // Queue
    addTrackToQueue(trackUri: string) {
      instance()
        .post(`me/player/queue?uri=${trackUri}`)
        .then(() => {
          this.getQueue();
          notification({
            msg: "Song added to queue",
            type: NotificationType.Success,
          });
        })
        .catch(() => {
          notification({
            msg: "Error adding song to queue",
            type: NotificationType.Error,
          });
        });
    },

    closeQueue() {
      this.queueOpened = false;
    },

    async getDeviceList() {
      this.devices.list = [];
      instance()
        .get<DevicesResponse>("me/player/devices")
        .then(({ data }) => {
          const activeDevice = data.devices.find((device) => device.is_active);
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

    getExternalPlayerState() {
      this.playerState = defaultPlaybackState;
      instance()
        .get<CurrentlyPlaying>("me/player")
        .then(({ data }) => {
          if (!data.item) return;

          const { item } = data;
          const current = this.playerState.track_window.current_track;
          const playerState = this.playerState;
          const activeDevice = this.devices.activeDevice;

          current.album = data.item.album;
          current.artists = item.artists;
          current.duration_ms = item.duration_ms;
          current.id = item.id;
          current.name = item.name;
          current.uri = item.uri;
          playerState.position = data.progress_ms;
          playerState.paused = !data.is_playing;
          playerState.shuffle = data.shuffle_state;
          playerState.duration = item.duration_ms;
          activeDevice.volume_percent = data.device.volume_percent;
        });
    },

    getQueue() {
      interface QueueResponse {
        queue: Track[];
      }

      instance()
        .get<QueueResponse>("me/player/queue")
        .then(({ data }) => {
          // Convertir les objets Track en Spotify.Track
          const spotifyTracks = data.queue.map((track) => ({
            album: {
              images: track.album.images,
              name: track.album.name,
              uri: track.album.uri,
            },
            artists: track.artists.map((artist) => ({
              name: artist.name,
              uri: artist.uri,
            })),
            duration_ms: track.duration_ms,
            id: track.id,
            is_playable: track.is_playable || true,
            media_type: "audio" as const, // Type explicite avec as const
            name: track.name,
            type: "track" as const, // Forcer la valeur à "track" qui est l'une des valeurs autorisées
            uid: track.id, // Utiliser l'ID comme UID
            uri: track.uri,
          }));
          this.queue = spotifyTracks;
        })
        .catch(() => {
          useNotification().addNotification({
            msg: "Error getting queue",
            type: NotificationType.Error,
          });
          this.queue = [];
        });
    },

    next(): void {
      instance().post("me/player/next");
    },

    openQueue() {
      this.getQueue();
      this.queueOpened = true;
    },

    pause(): void {
      instance().put("me/player/pause", {
        device_id: this.devices.activeDevice,
      });
    },

    play(): void {
      instance().put("me/player/play", {
        device_id: this.devices.activeDevice,
      });
    },

    seek(progress: number) {
      instance()
        .put(`me/player/seek?position_ms=${Math.round(progress)}`)
        .then(() => (this.currentlyPlaying.progress_ms = progress));
    },

    setDevice(deviceId: null | string) {
      this.playerState = defaultPlaybackState;
      instance()
        .put("me/player", { device_ids: [deviceId] })
        .then(() => {
          instance()
            .get<DevicesResponse>("me/player/devices")
            .then(({ data }) => {
              this.devices.list = data.devices;
              const activeDevice = data.devices.find((device) => device.id === deviceId);
              if (activeDevice) this.devices.activeDevice = activeDevice;
            });
        });
    },

    setVolume(volume: number) {
      instance()
        .put(`me/player/volume?volume_percent=${Math.round(volume)}`)
        .then(() => (this.devices.activeDevice.volume_percent = volume));
    },

    syncPlayerState(state: Spotify.PlaybackState) {
      this.playerState = state;
    },

    thisDevice(deviceId: string) {
      this.thisDeviceId = deviceId;
      this.getDeviceList();
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

    updateFromSDK(args: Spotify.Track, position: number) {
      this.currentFromSDK = args;
      this.currentPositionFromSDK = position;
    },
  },

  getters: {
    isExternalDevice(): boolean {
      return this.devices.activeDevice.id !== this.thisDeviceId;
    },
  },

  state: (): Player => ({
    currentFromSDK: null,
    currentlyPlaying: defaultCurrentlyPlaying,
    currentPositionFromSDK: 0,
    devices: {
      activeDevice: defaultDevice,
      list: [],
    },
    playerState: defaultPlaybackState,
    queue: [],
    queueOpened: false,
    thisDeviceId: "",
  }),
});
