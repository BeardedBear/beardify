import { defineStore } from "pinia";

import { CurrentlyPlaying } from "../../@types/CurrentlyPlaying";
import { defaultCurrentlyPlaying, defaultDevice } from "../../@types/Defaults";
import { Device, DevicesResponse } from "../../@types/Device";
import { NotificationType } from "../../@types/Notification";
import { defaultPlaybackState, Player } from "../../@types/Player";
import { Track } from "../../@types/Track";
import { instance } from "../../api";
import { notification } from "../../helpers/notifications";
import { createSpotifyPlayer } from "../../spotify";
import { useNotification } from "../notification/NotificationStore";

// Constants
const HEARTBEAT_INTERVAL = 2 * 60 * 1000; // 2 minutes
const KEEPALIVE_INTERVAL = 30 * 1000; // 30 seconds
const DEVICE_SWITCH_DELAY = 1000; // 1 second

interface ApiError {
  code?: string;
  message?: string;
  response?: {
    data?: ApiErrorResponse;
    status?: number;
    statusText?: string;
  };
}

// Types
interface ApiErrorResponse {
  error?: {
    message?: string;
    reason?: string;
  };
}

// Error handling utilities
const isApiError = (error: unknown): error is ApiError => {
  return typeof error === "object" && error !== null;
};

const handleApiError = (error: unknown, context: string) => {
  const apiError = isApiError(error) ? error : { message: "Unknown error" };
  console.error(`Error ${context}:`, error);

  let errorMessage = `Failed to ${context}`;
  let detailedError = "";

  if (apiError.response?.status === 404) {
    errorMessage = "Device not found or unavailable";
    detailedError = "The selected device is no longer available or has been disconnected";
  } else if (apiError.response?.status === 403) {
    errorMessage = "Operation not allowed (Premium required)";
    detailedError = "You need Spotify Premium to control playback on other devices";
  } else if (apiError.response?.status === 502) {
    errorMessage = "Device is temporarily unavailable";
    detailedError = "The device is currently busy or unresponsive. Try again in a moment";
  } else if (apiError.response?.status === 429) {
    errorMessage = "Too many requests";
    detailedError = "Rate limit exceeded. Please wait before trying again";
  } else if (apiError.response?.data?.error?.message) {
    errorMessage = apiError.response.data.error.message;
    detailedError = `Reason: ${apiError.response.data.error.reason || "Unknown"}`;
  } else if (apiError.message) {
    detailedError = apiError.message;
  }

  // Log full error details for debugging
  console.error("Full error details:", {
    code: apiError.code,
    data: apiError.response?.data,
    message: apiError.message,
    status: apiError.response?.status,
    statusText: apiError.response?.statusText,
  });

  return { detailedError, errorMessage };
};

const mapTrackToSpotify = (track: Track): Spotify.Track => ({
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
  media_type: "audio" as const,
  name: track.name,
  type: "track" as const,
  uid: track.id,
  uri: track.uri,
});

export const usePlayer = defineStore("player", {
  actions: {
    // ===== QUEUE MANAGEMENT =====
    addTrackToQueue(trackUri: string): void {
      instance()
        .post(`me/player/queue?uri=${trackUri}`)
        .then((): void => {
          this.getQueue();
          notification({
            msg: "Song added to queue",
            type: NotificationType.Success,
          });
        })
        .catch((error): void => {
          const { errorMessage } = handleApiError(error, "add song to queue");
          notification({
            msg: errorMessage,
            type: NotificationType.Error,
          });
        });
    },

    checkDeviceStatus(): void {
      instance()
        .get<DevicesResponse>("me/player/devices")
        .then(({ data }): void => {
          const currentDevice = data.devices.find((device): boolean => device.id === this.devices.activeDevice.id);

          if (currentDevice && !currentDevice.is_active) {
            this.setDevice(currentDevice.id);
          } else if (!currentDevice && data.devices.length > 0) {
            this.setDevice(data.devices[0].id);
          }
        })
        .catch(() => {
          this.getDeviceList();
        });
    },

    closeQueue(): void {
      this.queueOpened = false;
    },

    // ===== DEVICE MANAGEMENT =====
    async getDeviceList(): Promise<void> {
      this.devices.list = [];

      try {
        const { data } = await instance().get<DevicesResponse>("me/player/devices");
        const activeDevice = data.devices.find((device): boolean => device.is_active);

        this.devices.list = data.devices;

        if (!data.devices.length) {
          createSpotifyPlayer().connect();
        } else if (activeDevice) {
          this.devices.activeDevice = activeDevice;
        } else {
          this.setDevice(this.thisDeviceId);
        }

        this.startDeviceHeartbeat();
      } catch (error) {
        const { errorMessage } = handleApiError(error, "get device list");
        notification({
          msg: errorMessage,
          type: NotificationType.Error,
        });
      }
    },

    getExternalPlayerState(): void {
      this.playerState = defaultPlaybackState;

      instance()
        .get<CurrentlyPlaying>("me/player")
        .then(({ data }): void => {
          if (!data.item) return;

          this.updatePlayerStateFromData(data);
        })
        .catch((error): void => {
          const { errorMessage } = handleApiError(error, "get player state");
          console.warn(errorMessage);
        });
    },

    getQueue(): void {
      interface QueueResponse {
        queue: Track[];
      }

      instance()
        .get<QueueResponse>("me/player/queue")
        .then(({ data }): void => {
          this.queue = data.queue.map(mapTrackToSpotify);
        })
        .catch((error): void => {
          const { errorMessage } = handleApiError(error, "get queue");
          useNotification().addNotification({
            msg: errorMessage,
            type: NotificationType.Error,
          });
          this.queue = [];
        });
    },

    handleDeviceSwitchResult(activeDevice: Device | undefined): void {
      if (activeDevice && activeDevice.is_active) {
        this.devices.activeDevice = activeDevice;
        notification({
          msg: `Successfully switched to ${activeDevice.name}`,
          type: NotificationType.Success,
        });
        this.startDeviceHeartbeat();
      } else if (activeDevice) {
        this.devices.activeDevice = activeDevice;
        this.startDeviceHeartbeat();
        notification({
          msg: `Device ${activeDevice.name} selected but may need activation`,
          type: NotificationType.Warning,
        });
      } else {
        notification({
          msg: "Device not found after switching",
          type: NotificationType.Error,
        });
      }
    },

    // ===== PLAYBACK CONTROL =====
    next(): void {
      instance()
        .post("me/player/next")
        .catch((error): void => {
          const { errorMessage } = handleApiError(error, "skip to next track");
          notification({
            msg: errorMessage,
            type: NotificationType.Error,
          });
        });
    },

    openQueue(): void {
      this.getQueue();
      this.queueOpened = true;
    },

    pause(): void {
      instance()
        .put("me/player/pause", {
          device_id: this.devices.activeDevice,
        })
        .catch((error): void => {
          const { errorMessage } = handleApiError(error, "pause playback");
          notification({
            msg: errorMessage,
            type: NotificationType.Error,
          });
        });
    },

    play(): void {
      instance()
        .put("me/player/play", {
          device_id: this.devices.activeDevice,
        })
        .catch((error): void => {
          const { errorMessage } = handleApiError(error, "start playback");
          notification({
            msg: errorMessage,
            type: NotificationType.Error,
          });
        });
    },

    seek(progress: number): void {
      instance()
        .put(`me/player/seek?position_ms=${Math.round(progress)}`)
        .then(() => (this.currentlyPlaying.progress_ms = progress))
        .catch((error): void => {
          const { errorMessage } = handleApiError(error, "seek track");
          notification({
            msg: errorMessage,
            type: NotificationType.Error,
          });
        });
    },

    setDevice(deviceId: null | string): void {
      this.playerState = defaultPlaybackState;

      notification({
        msg: "Switching device...",
        type: NotificationType.Success,
      });

      instance()
        .put("me/player", { device_ids: [deviceId] })
        .then(() => this.verifyDeviceSwitch(deviceId))
        .catch((error): void => {
          const { detailedError, errorMessage } = handleApiError(error, "switch device");
          notification({
            msg: detailedError ? `${errorMessage}: ${detailedError}` : errorMessage,
            type: NotificationType.Error,
          });
        });
    },

    setVolume(volume: number): void {
      instance()
        .put(`me/player/volume?volume_percent=${Math.round(volume)}`)
        .then((): number => (this.devices.activeDevice.volume_percent = volume))
        .catch((error): void => {
          const { errorMessage } = handleApiError(error, "set volume");
          notification({
            msg: errorMessage,
            type: NotificationType.Error,
          });
        });
    },

    // ===== HEARTBEAT MANAGEMENT =====
    startDeviceHeartbeat(): void {
      this.stopDeviceHeartbeat();
      this.startKeepAlive();
      this.startHeartbeat();
    },

    startHeartbeat(): void {
      this.heartbeatInterval = window.setInterval((): void => {
        if (this.devices.activeDevice?.id) {
          this.checkDeviceStatus();
        }
      }, HEARTBEAT_INTERVAL);
    },

    startKeepAlive(): void {
      this.keepaliveInterval = window.setInterval((): void => {
        if (this.devices.activeDevice?.id) {
          instance()
            .get("me/player")
            .catch(() => {
              // Silently ignore errors for keep-alive requests
            });
        }
      }, KEEPALIVE_INTERVAL);
    },

    stopDeviceHeartbeat(): void {
      if (this.heartbeatInterval) {
        window.clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }
      if (this.keepaliveInterval) {
        window.clearInterval(this.keepaliveInterval);
        this.keepaliveInterval = null;
      }
    },

    // ===== PLAYER SYNC =====
    syncPlayerState(state: Spotify.PlaybackState): void {
      this.playerState = state;
    },

    thisDevice(deviceId: string): void {
      this.thisDeviceId = deviceId;
      this.getDeviceList();
    },

    // ===== TOGGLE CONTROLS =====
    toggleRepeat(): void {
      const newState = this.currentlyPlaying.repeat_state === "off" ? "context" : "off";

      instance()
        .put(`me/player/repeat?state=${newState}`)
        .then((): string => (this.currentlyPlaying.repeat_state = newState))
        .catch((error): void => {
          const { errorMessage } = handleApiError(error, "toggle repeat");
          notification({
            msg: errorMessage,
            type: NotificationType.Error,
          });
        });
    },

    toggleShuffle(): void {
      const newState = !this.currentlyPlaying.shuffle_state;

      instance()
        .put(`me/player/shuffle?state=${newState}`)
        .then((): boolean => (this.currentlyPlaying.shuffle_state = newState))
        .catch((error): void => {
          const { errorMessage } = handleApiError(error, "toggle shuffle");
          notification({
            msg: errorMessage,
            type: NotificationType.Error,
          });
        });
    },

    updateFromSDK(args: Spotify.Track, position: number): void {
      this.currentFromSDK = args;
      this.currentPositionFromSDK = position;
    },

    updatePlayerStateFromData(data: CurrentlyPlaying): void {
      const { item } = data;
      if (!item) return;

      const current = this.playerState.track_window.current_track;
      const playerState = this.playerState;
      const activeDevice = this.devices.activeDevice;

      current.album = item.album;
      current.artists = item.artists;
      current.duration_ms = item.duration_ms;
      current.id = item.id;
      current.name = item.name;
      current.uri = item.uri;
      playerState.position = data.progress_ms;
      playerState.paused = !data.is_playing;
      playerState.shuffle = data.shuffle_state;
      playerState.duration = item.duration_ms;

      if (data.device?.volume_percent !== undefined) {
        activeDevice.volume_percent = data.device.volume_percent;
      }
    },

    verifyDeviceSwitch(deviceId: null | string): void {
      setTimeout(() => {
        instance()
          .get<DevicesResponse>("me/player/devices")
          .then(({ data }): void => {
            this.devices.list = data.devices;
            const activeDevice = data.devices.find((device): boolean => device.id === deviceId);

            this.handleDeviceSwitchResult(activeDevice);
          })
          .catch((error): void => {
            const { errorMessage } = handleApiError(error, "verify device switch");
            notification({
              msg: errorMessage,
              type: NotificationType.Error,
            });
          });
      }, DEVICE_SWITCH_DELAY);
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
    keepaliveInterval: null,
    playerState: defaultPlaybackState,
    queue: [],
    queueOpened: false,
    thisDeviceId: "",
  }),
});
