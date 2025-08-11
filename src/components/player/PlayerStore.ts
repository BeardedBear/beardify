import { defineStore } from "pinia";

import { CurrentlyPlaying } from "../../@types/CurrentlyPlaying";
import { defaultCurrentlyPlaying, defaultDevice } from "../../@types/Defaults";
import { DevicesResponse } from "../../@types/Device";
import { NotificationType } from "../../@types/Notification";
import { defaultPlaybackState, Player } from "../../@types/Player";
import { Track } from "../../@types/Track";
import { instance } from "../../api";
import { notification } from "../../helpers/notifications";
import { createSpotifyPlayer } from "../../spotify";
import { useNotification } from "../notification/NotificationStore";

// Heartbeat interval in milliseconds (4 minutes)
const HEARTBEAT_INTERVAL = 4 * 60 * 1000;

export const usePlayer = defineStore("player", {
  actions: {
    async addTrackToQueue(trackUri: string): Promise<void> {
      try {
        await instance().post(`me/player/queue?uri=${trackUri}`);
        await this.getQueue();
        notification({
          msg: "Song added to queue",
          type: NotificationType.Success,
        });
      } catch {
        notification({
          msg: "Error adding song to queue",
          type: NotificationType.Error,
        });
      }
    },

    closeQueue(): void {
      this.queueOpened = false;
    },

    async getDeviceList(): Promise<void> {
      this.devices.list = [];
      const { data } = await instance().get<DevicesResponse>("me/player/devices");
      const activeDevice = data.devices.find((device): boolean => device.is_active);
      this.devices.list = data.devices;
      if (!data.devices.length) createSpotifyPlayer().connect();
      if (!this.playerState?.paused && activeDevice) {
        this.devices.activeDevice = activeDevice;
      } else if (activeDevice?.is_active) {
        this.devices.activeDevice = activeDevice;
      } else {
        this.setDevice(this.thisDeviceId);
      }
      this.startDeviceHeartbeat();
    },

    async getExternalPlayerState(): Promise<void> {
      this.playerState = defaultPlaybackState;
      const { data } = await instance().get<CurrentlyPlaying>("me/player");
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
    },

    async getQueue(): Promise<void> {
      interface QueueResponse {
        queue: Track[];
      }
      try {
        const { data } = await instance().get<QueueResponse>("me/player/queue");
        const spotifyTracks = data.queue.map(
          (track): Spotify.Track =>
            ({
              album: {
                images: track.album.images,
                name: track.album.name,
                uri: track.album.uri,
              },
              artists: track.artists.map(
                (artist): Spotify.Artist => ({
                  name: artist.name,
                  uri: artist.uri,
                }),
              ),
              duration_ms: track.duration_ms,
              id: track.id,
              is_playable: track.is_playable || true,
              media_type: "audio",
              name: track.name,
              type: "track",
              uid: track.id,
              uri: track.uri,
            }) satisfies Spotify.Track,
        );
        this.queue = spotifyTracks;
      } catch {
        const currentTrack = this.playerState?.track_window?.current_track;
        const isPlayingPodcast = currentTrack?.type === "episode" || currentTrack?.uri?.includes("spotify:episode:");
        if (!isPlayingPodcast) {
          useNotification().addNotification({
            msg: "Error getting queue",
            type: NotificationType.Error,
          });
        }
        this.queue = [];
      }
    },

    next(): void {
      instance().post("me/player/next");
    },

    openQueue(): void {
      // Check if currently playing content is a podcast episode
      const currentTrack = this.playerState?.track_window?.current_track;
      const isPlayingPodcast = currentTrack?.type === "episode" || currentTrack?.uri?.includes("spotify:episode:");

      // Only get queue if not playing a podcast episode
      if (!isPlayingPodcast) {
        this.getQueue();
      } else {
        // Clear queue for podcast episodes as they don't have a queue
        this.queue = [];
      }

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

    async seek(progress: number): Promise<void> {
      await instance().put(`me/player/seek?position_ms=${Math.round(progress)}`);
      this.currentlyPlaying.progress_ms = progress;
    },

    async setDevice(deviceId: null | string): Promise<void> {
      this.playerState = defaultPlaybackState;
      await instance().put("me/player", { device_ids: [deviceId] });
      const { data } = await instance().get<DevicesResponse>("me/player/devices");
      this.devices.list = data.devices;
      const activeDevice = data.devices.find((device): boolean => device.id === deviceId);
      if (activeDevice) {
        this.devices.activeDevice = activeDevice;
        this.startDeviceHeartbeat();
      }
    },

    async setVolume(volume: number): Promise<void> {
      await instance().put(`me/player/volume?volume_percent=${Math.round(volume)}`);
      this.devices.activeDevice.volume_percent = volume;
    },

    startDeviceHeartbeat(): void {
      this.stopDeviceHeartbeat();

      this.heartbeatInterval = window.setInterval((): void => {
        // If we have an active device, send a signal to keep it active
        if (this.devices.activeDevice?.id) {
          (async (): Promise<void> => {
            try {
              const { data } = await instance().get<DevicesResponse>("me/player/devices");
              const currentDevice = data.devices.find((device): boolean => device.id === this.devices.activeDevice.id);
              if (currentDevice && !currentDevice.is_active) {
                this.setDevice(currentDevice.id);
              } else if (!currentDevice && data.devices.length > 0) {
                this.setDevice(data.devices[0].id);
              }
            } catch {
              // silent heartbeat error
            }
          })();
        }
      }, HEARTBEAT_INTERVAL);
    },

    // Stop the heartbeat
    stopDeviceHeartbeat(): void {
      if (this.heartbeatInterval) {
        window.clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }
    },

    syncPlayerState(state: Spotify.PlaybackState): void {
      this.playerState = state;
    },

    thisDevice(deviceId: string): void {
      this.thisDeviceId = deviceId;
      this.getDeviceList();
    },

    toggleRepeat(): void {
      if (this.currentlyPlaying.repeat_state === "off") {
        (async (): Promise<void> => {
          try {
            await instance().put("me/player/repeat?state=context");
            this.currentlyPlaying.repeat_state = "context";
          } catch {
            // silent
          }
        })();
      } else {
        (async (): Promise<void> => {
          try {
            await instance().put("me/player/repeat?state=off");
            this.currentlyPlaying.repeat_state = "off";
          } catch {
            // silent
          }
        })();
      }
    },

    toggleShuffle(): void {
      if (this.currentlyPlaying.shuffle_state) {
        (async (): Promise<void> => {
          try {
            await instance().put("me/player/shuffle?state=false");
            this.currentlyPlaying.shuffle_state = false;
          } catch {
            // silent
          }
        })();
      } else {
        (async (): Promise<void> => {
          try {
            await instance().put("me/player/shuffle?state=true");
            this.currentlyPlaying.shuffle_state = true;
          } catch {
            // silent
          }
        })();
      }
    },

    updateFromSDK(args: Spotify.Track, position: number): void {
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
    heartbeatInterval: null,
    playerState: defaultPlaybackState,
    queue: [],
    queueOpened: false,
    thisDeviceId: "",
  }),
});
