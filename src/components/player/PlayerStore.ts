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

// Heartbeat interval in milliseconds (2 minutes)
const HEARTBEAT_INTERVAL = 2 * 60 * 1000;
// Keep-alive interval in milliseconds (30 seconds)
const KEEPALIVE_INTERVAL = 30 * 1000;

export const usePlayer = defineStore("player", {
  actions: {
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
        .catch((): void => {
          notification({
            msg: "Error adding song to queue",
            type: NotificationType.Error,
          });
        });
    },

    closeQueue(): void {
      this.queueOpened = false;
    },

    async getDeviceList(): Promise<void> {
      this.devices.list = [];
      instance()
        .get<DevicesResponse>("me/player/devices")
        .then(({ data }): void => {
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

          // Start the heartbeat after refreshing the device list
          this.startDeviceHeartbeat();
        });
    },

    getExternalPlayerState(): void {
      this.playerState = defaultPlaybackState;
      instance()
        .get<CurrentlyPlaying>("me/player")
        .then(({ data }): void => {
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

    getQueue(): void {
      interface QueueResponse {
        queue: Track[];
      }

      instance()
        .get<QueueResponse>("me/player/queue")
        .then(({ data }): void => {
          const spotifyTracks = data.queue.map(
            (track): Spotify.Track => ({
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
            }),
          );
          this.queue = spotifyTracks;
        })
        .catch((): void => {
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
          console.error("Error pausing playback:", error);
          let errorMessage = "Failed to pause playback";

          if (error.response?.status === 404) {
            errorMessage = "No active device found";
          } else if (error.response?.data?.error?.reason === "NO_ACTIVE_DEVICE") {
            errorMessage = "No active device - please select a device first";
          }

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
          console.error("Error starting playback:", error);
          let errorMessage = "Failed to start playback";

          if (error.response?.status === 404) {
            errorMessage = "No active device found";
          } else if (error.response?.data?.error?.reason === "NO_ACTIVE_DEVICE") {
            errorMessage = "No active device - please select a device first";
          } else if (error.response?.data?.error?.reason === "PREMIUM_REQUIRED") {
            errorMessage = "Spotify Premium required for device control";
          }

          notification({
            msg: errorMessage,
            type: NotificationType.Error,
          });
        });
    },

    seek(progress: number): void {
      instance()
        .put(`me/player/seek?position_ms=${Math.round(progress)}`)
        .then(() => (this.currentlyPlaying.progress_ms = progress));
    },

    setDevice(deviceId: null | string): void {
      this.playerState = defaultPlaybackState;

      // Show loading notification
      notification({
        msg: "Switching device...",
        type: NotificationType.Success,
      });

      instance()
        .put("me/player", { device_ids: [deviceId] })
        .then((): void => {
          // Wait a moment for Spotify to process the device switch
          setTimeout(() => {
            instance()
              .get<DevicesResponse>("me/player/devices")
              .then(({ data }): void => {
                this.devices.list = data.devices;
                const activeDevice = data.devices.find((device): boolean => device.id === deviceId);

                if (activeDevice && activeDevice.is_active) {
                  this.devices.activeDevice = activeDevice;

                  notification({
                    msg: `Successfully switched to ${activeDevice.name}`,
                    type: NotificationType.Success,
                  });

                  // Start the heartbeat after setting a new active device
                  this.startDeviceHeartbeat();
                } else if (activeDevice) {
                  // Device exists but not active, try to activate it
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
              })
              .catch((error): void => {
                console.error("Error fetching devices after switch:", error);
                notification({
                  msg: "Error verifying device switch",
                  type: NotificationType.Error,
                });
              });
          }, 1000); // Wait 1 second for Spotify to process
        })
        .catch((error): void => {
          console.error("Error switching device:", error);

          let errorMessage = "Failed to switch device";
          let detailedError = "";

          // Handle specific error cases
          if (error.response?.status === 404) {
            errorMessage = "Device not found or unavailable";
            detailedError = "The selected device is no longer available or has been disconnected";
          } else if (error.response?.status === 403) {
            errorMessage = "Device switch not allowed (Premium required)";
            detailedError = "You need Spotify Premium to control playback on other devices";
          } else if (error.response?.status === 502) {
            errorMessage = "Device is temporarily unavailable";
            detailedError = "The device is currently busy or unresponsive. Try again in a moment";
          } else if (error.response?.status === 429) {
            errorMessage = "Too many requests";
            detailedError = "Rate limit exceeded. Please wait before trying again";
          } else if (error.response?.data?.error?.message) {
            errorMessage = error.response.data.error.message;
            detailedError = `Reason: ${error.response.data.error.reason || "Unknown"}`;
          } else if (error.message) {
            detailedError = error.message;
          }

          // Log full error details for debugging
          console.error("Full error details:", {
            code: error.code,
            data: error.response?.data,
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
          });

          notification({
            msg: detailedError ? `${errorMessage}: ${detailedError}` : errorMessage,
            type: NotificationType.Error,
          });
        });
    },

    setVolume(volume: number): void {
      instance()
        .put(`me/player/volume?volume_percent=${Math.round(volume)}`)
        .then((): number => (this.devices.activeDevice.volume_percent = volume));
    },

    startDeviceHeartbeat(): void {
      this.stopDeviceHeartbeat();

      // Keep-alive: Send periodic requests to maintain device session
      this.keepaliveInterval = window.setInterval((): void => {
        if (this.devices.activeDevice?.id) {
          // Light request to keep the device session alive
          instance()
            .get("me/player")
            .catch(() => {
              // Ignore errors, this is just to keep the session alive
            });
        }
      }, KEEPALIVE_INTERVAL);

      // Heartbeat: Check and restore device activity
      this.heartbeatInterval = window.setInterval((): void => {
        if (this.devices.activeDevice?.id) {
          instance()
            .get<DevicesResponse>("me/player/devices")
            .then(({ data }): void => {
              const currentDevice = data.devices.find((device): boolean => device.id === this.devices.activeDevice.id);

              // If the device is no longer active, try to reactivate it
              if (currentDevice && !currentDevice.is_active) {
                this.setDevice(currentDevice.id);
              }
              // If the device has disappeared completely, try to activate the first available one
              else if (!currentDevice && data.devices.length > 0) {
                this.setDevice(data.devices[0].id);
              }
            })
            .catch(() => {
              // On error, try to refresh device list
              this.getDeviceList();
            });
        }
      }, HEARTBEAT_INTERVAL);
    },

    // Stop the heartbeat and keep-alive
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

    syncPlayerState(state: Spotify.PlaybackState): void {
      this.playerState = state;
    },

    thisDevice(deviceId: string): void {
      this.thisDeviceId = deviceId;
      this.getDeviceList();
    },

    toggleRepeat(): void {
      if (this.currentlyPlaying.repeat_state === "off") {
        instance()
          .put("me/player/repeat?state=context")
          .then((): string => (this.currentlyPlaying.repeat_state = "context"));
      } else {
        instance()
          .put("me/player/repeat?state=off")
          .then((): string => (this.currentlyPlaying.repeat_state = "off"));
      }
    },

    toggleShuffle(): void {
      if (this.currentlyPlaying.shuffle_state) {
        instance()
          .put("me/player/shuffle?state=false")
          .then((): boolean => (this.currentlyPlaying.shuffle_state = false));
      } else {
        instance()
          .put("me/player/shuffle?state=true")
          .then((): boolean => (this.currentlyPlaying.shuffle_state = true));
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
    keepaliveInterval: null,
    playerState: defaultPlaybackState,
    queue: [],
    queueOpened: false,
    thisDeviceId: "",
  }),
});
