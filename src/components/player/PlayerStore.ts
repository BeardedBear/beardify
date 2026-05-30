import { defineStore } from "pinia";

import { CurrentlyPlaying } from "@/@types/CurrentlyPlaying";
import { defaultCurrentlyPlaying, defaultDevice } from "@/@types/Defaults";
import { DevicesResponse } from "@/@types/Device";
import { NotificationType } from "@/@types/Notification";
import { defaultPlaybackState, Player } from "@/@types/Player";
import { Track } from "@/@types/Track";
import { instance } from "@/api";
import { isTouchDevice } from "@/helpers/isTouchDevice";
import { notification } from "@/helpers/notifications";
import {
  isPodcastTrack,
  mapQueueToSpotifyTracks,
  notifyQueueError,
  setRepeatState,
  setShuffleState,
} from "@/helpers/player";
import { sleep } from "@/helpers/sleep";
import { createSpotifyPlayer } from "@/spotify";

const HEARTBEAT_INTERVAL = 4 * 60 * 1000;
const DEVICE_SWITCH_TIMEOUT_MS = 15_000;
const ACTIVATION_DELAY_MS = 200;
const RETRY_DELAY_MS = 300;
const HEARTBEAT_FAILURE_THRESHOLD = 3;
const HEARTBEAT_FAILURE_NOTIFY_COOLDOWN_MS = 5 * 60 * 1000;
const VOLUME_LOCK_DURATION_MS = 2000;

export const usePlayer = defineStore("player", {
  actions: {
    async _attemptDeviceActivation(
      targetDeviceId: string,
      maxAttempts: number,
      hasTimedOut: () => boolean,
    ): Promise<void> {
      for (let attempt = 0; attempt < maxAttempts && !hasTimedOut(); attempt++) {
        const desiredId = this.lastRequestedDeviceId ?? targetDeviceId;

        if (this._isDeviceAlreadyActive(desiredId)) break;

        const activated = await this._tryActivateDevice(desiredId, maxAttempts, hasTimedOut);

        if (hasTimedOut()) break;
        if (this._shouldStopAfterActivation(activated, desiredId)) break;
      }
    },

    async _executeDeviceSwitch(targetDeviceId: string, retries: number): Promise<void> {
      this.isSettingDevice = true;
      this.playerState = defaultPlaybackState;

      const startTime = Date.now();
      const hasTimedOut = (): boolean => Date.now() - startTime >= DEVICE_SWITCH_TIMEOUT_MS;
      const maxAttempts = Math.max(1, retries);

      await this._attemptDeviceActivation(targetDeviceId, maxAttempts, hasTimedOut);
      await this._finalizeDeviceSwitch(targetDeviceId, retries, hasTimedOut);
    },

    async _finalizeDeviceSwitch(targetDeviceId: string, retries: number, hasTimedOut: () => boolean): Promise<void> {
      const finalRequested = this.lastRequestedDeviceId;
      this.lastRequestedDeviceId = null;
      this.isSettingDevice = false;

      // Honor a pending request ONLY if a *different* device was asked for while
      // switching. Re-queueing the same target that just failed would loop
      // forever on ghost/stale devices that can never become active.
      if (
        !hasTimedOut()
        && finalRequested
        && finalRequested !== targetDeviceId
        && finalRequested !== this.devices.activeDevice?.id
      ) {
        await this.setDevice(finalRequested, retries);
        return;
      }

      // Switch succeeded — nothing else to do.
      if (this._isDeviceAlreadyActive(targetDeviceId)) return;

      // Switch failed (e.g. ghost device still listed by Spotify but unreachable).
      // Drop the dead device from the list so the user can't keep clicking it,
      // and recover the player view that was blanked at the start of the switch.
      try {
        const { data } = await instance().get<DevicesResponse>("me/player/devices");
        this.devices.list = data.devices.filter((device) => device.id !== targetDeviceId || device.is_active);
      } catch {
        // ignore refresh errors
      }
      try {
        await this.getExternalPlayerState();
      } catch {
        // ignore recovery errors
      }

      notification({
        msg: "Failed to switch device. It may be offline — the device list has been refreshed.",
        type: NotificationType.Error,
      });
    },

    _isDeviceAlreadyActive(deviceId: string): boolean {
      return this.devices.activeDevice?.id === deviceId;
    },

    async _performActivationAttempt(deviceId: string): Promise<boolean> {
      try {
        await instance().put("me/player", { device_ids: [deviceId] });

        const { data } = await instance().get<DevicesResponse>("me/player/devices");
        this.devices.list = data.devices;

        const activeDevice = data.devices.find((device) => device.id === deviceId);
        if (activeDevice) {
          this.devices.activeDevice = activeDevice;
          this.startDeviceHeartbeat();
          return true;
        }

        await sleep(ACTIVATION_DELAY_MS);
        return false;
      } catch {
        await sleep(RETRY_DELAY_MS);
        return false;
      }
    },

    _shouldStopAfterActivation(activated: boolean, desiredId: string): boolean {
      const hasNewRequest = this.lastRequestedDeviceId && this.lastRequestedDeviceId !== desiredId;

      if (activated) {
        if (this.lastRequestedDeviceId === desiredId) {
          this.lastRequestedDeviceId = null;
        }
        return !hasNewRequest;
      }

      return !hasNewRequest;
    },

    async _tryActivateDevice(deviceId: string, maxRetries: number, hasTimedOut: () => boolean): Promise<boolean> {
      for (let attempt = 0; attempt < maxRetries && !hasTimedOut(); attempt++) {
        const success = await this._performActivationAttempt(deviceId);
        if (success) return true;
      }
      return false;
    },
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

    closePanel(): void {
      this.panelOpened = false;
    },

    closeQueue(): void {
      this.queueOpened = false;
    },

    async getDeviceList(): Promise<void> {
      const { data } = await instance().get<DevicesResponse>("me/player/devices");
      const activeDevice = data.devices.find((device): boolean => device.is_active);
      this.devices.list = data.devices;
      if (!data.devices.length) createSpotifyPlayer().connect();
      if (!this.playerState?.paused && activeDevice) {
        this.devices.activeDevice = activeDevice;
      } else if (activeDevice?.is_active) {
        this.devices.activeDevice = activeDevice;
      } else if (this.thisDeviceId) {
        this.setDevice(this.thisDeviceId);
      }
      this.startDeviceHeartbeat();
    },

    async getExternalPlayerState(): Promise<void> {
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
      if (Date.now() >= (this.volumeLockUntil ?? 0) && data.device) {
        activeDevice.volume_percent = data.device.volume_percent;
      }
    },

    async getQueue(): Promise<void> {
      interface QueueResponse {
        queue: Track[];
      }
      try {
        const { data } = await instance().get<QueueResponse>("me/player/queue");
        this.queue = mapQueueToSpotifyTracks(data.queue);
      } catch {
        const currentTrack = this.playerState?.track_window?.current_track;
        const isPlayingPodcast = isPodcastTrack(currentTrack);
        if (!isPlayingPodcast) {
          notifyQueueError();
        }
        this.queue = [];
      }
    },

    next(): void {
      this.playerState.paused = false;
      instance().post("me/player/next");
    },

    // Slide-up panel controls
    // Opening is restricted to touch devices (mobile) to avoid showing the mobile-only slide-up on desktop
    openPanel(): void {
      if (!isTouchDevice()) return;
      this.panelOpened = true;
    },

    openQueue(): void {
      // Only get queue when not playing a podcast episode
      const currentTrack = this.playerState?.track_window?.current_track;
      if (!isPodcastTrack(currentTrack)) {
        this.getQueue();
      } else {
        this.queue = [];
      }

      this.queueOpened = true;
    },

    pause(): void {
      this.playerState.paused = true;
      instance().put("me/player/pause", {
        device_id: this.devices.activeDevice?.id,
      });
    },

    play(): void {
      this.playerState.paused = false;
      instance().put("me/player/play", {
        device_id: this.devices.activeDevice?.id,
      });
    },

    previous(): void {
      this.playerState.paused = false;
      instance().post("me/player/previous");
    },

    async seek(progress: number): Promise<void> {
      this.currentlyPlaying.progress_ms = progress;
      this.playerState.position = progress;
      await instance().put(`me/player/seek?position_ms=${Math.round(progress)}`);
    },

    async setDevice(deviceId: null | string, retries = 3): Promise<void> {
      const targetDeviceId = deviceId ?? this.thisDeviceId;
      if (this.devices.activeDevice?.id === targetDeviceId) return;

      this.lastRequestedDeviceId = targetDeviceId;
      if (this.isSettingDevice) return;

      await this._executeDeviceSwitch(targetDeviceId, retries);
    },

    async setVolume(volume: number): Promise<void> {
      const rounded = Math.round(volume);
      this.volumeLockUntil = Date.now() + VOLUME_LOCK_DURATION_MS;
      if (this.devices.activeDevice && this.devices.activeDevice.volume_percent !== rounded) {
        this.devices.activeDevice.volume_percent = rounded;
      }
      await instance().put(`me/player/volume?volume_percent=${rounded}`);
      // Persist the volume for the current device so we can restore it later
      try {
        const { saveDeviceVolume } = await import("@/helpers/player");
        saveDeviceVolume(this.devices.activeDevice?.id, rounded);
      } catch {
        // ignore
      }
    },

    startDeviceHeartbeat(): void {
      if (this.heartbeatInterval !== null) return;

      this.heartbeatInterval = window.setInterval((): void => {
        // If we have an active device, attempt to KEEP it active by sending a lightweight PUT
        // (transfer playback to the same device without altering playback state). Then refresh
        // the device list to detect changes and re-activate if necessary.
        if (this.devices.activeDevice?.id) {
          (async (): Promise<void> => {
            try {
              const doKeepalive = async (): Promise<void> => {
                if (!this.playerState?.paused) return;
                await instance().put("me/player", { device_ids: [this.devices.activeDevice.id] });
              };

              await doKeepalive();

              // Ping the SDK player instance to keep its session alive and detect disconnects early
              try {
                const player = createSpotifyPlayer();
                const sdkState = await player.getCurrentState();
                if (!sdkState) {
                  const connected = await player.connect();
                  if (connected) {
                    const volPercent = this.devices.activeDevice?.volume_percent;
                    if (typeof volPercent === "number") {
                      try {
                        await player.setVolume(Math.max(0, Math.min(1, volPercent / 100)));
                      } catch {
                        // ignore
                      }
                    }
                  }
                }
              } catch (e) {
                if (import.meta.env.DEV) {
                  // eslint-disable-next-line no-console
                  console.debug("SDK ping/connect failed during heartbeat", e);
                }
              }

              // Still verify device status via API and fall back to setDevice if needed
              const { data } = await instance().get<DevicesResponse>("me/player/devices");
              const currentDevice = data.devices.find((device): boolean => device.id === this.devices.activeDevice.id);
              if (currentDevice && !currentDevice.is_active) {
                this.setDevice(currentDevice.id);
              } else if (!currentDevice && data.devices.length > 0) {
                this.setDevice(data.devices[0].id);
              }

              // Success: reset failure counters
              this.heartbeatFailureCount = 0;
              this.heartbeatFailureNotified = false;
            } catch (e) {
              // Count consecutive heartbeat failures and notify/retry after threshold
              this.heartbeatFailureCount = (this.heartbeatFailureCount ?? 0) + 1;

              if (import.meta.env.DEV) {
                // eslint-disable-next-line no-console
                console.debug("Heartbeat keepalive failed for device", this.devices.activeDevice?.id, e);
              }

              if (this.heartbeatFailureCount >= HEARTBEAT_FAILURE_THRESHOLD && !this.heartbeatFailureNotified) {
                this.heartbeatFailureNotified = true;

                notification({
                  msg: "Device keepalive failing repeatedly. Attempting to reconnect the SDK and refresh device list.",
                  type: NotificationType.Warning,
                });

                // Try to reconnect the SDK player and refresh device list
                try {
                  const player = createSpotifyPlayer();
                  await player.connect();
                } catch {
                  // ignore
                }
                try {
                  await this.getDeviceList();
                } catch {
                  // ignore
                }

                // Reset notification flag after cooldown so user can be notified again later if problem persists
                setTimeout(() => {
                  this.heartbeatFailureNotified = false;
                }, HEARTBEAT_FAILURE_NOTIFY_COOLDOWN_MS);
              }
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

    togglePanel(): void {
      // Prevent toggling open on non-touch devices; allow closing always
      if (!this.panelOpened && !isTouchDevice()) return;
      this.panelOpened = !this.panelOpened;
    },

    async toggleRepeat(): Promise<void> {
      const nextState = this.currentlyPlaying.repeat_state === "off" ? "context" : "off";
      const prevState = this.currentlyPlaying.repeat_state;
      this.currentlyPlaying.repeat_state = nextState;
      try {
        const ok = await setRepeatState(nextState);
        if (!ok) this.currentlyPlaying.repeat_state = prevState;
      } catch {
        this.currentlyPlaying.repeat_state = prevState;
      }
    },

    async toggleShuffle(): Promise<void> {
      const nextState = !this.currentlyPlaying.shuffle_state;
      const prevState = this.currentlyPlaying.shuffle_state;
      this.currentlyPlaying.shuffle_state = nextState;
      this.playerState.shuffle = nextState;
      try {
        const ok = await setShuffleState(nextState);
        if (!ok) {
          this.currentlyPlaying.shuffle_state = prevState;
          this.playerState.shuffle = prevState;
        }
      } catch {
        this.currentlyPlaying.shuffle_state = prevState;
        this.playerState.shuffle = prevState;
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
    // Track heartbeat failures to notify and attempt reconnection when needed
    heartbeatFailureCount: 0,
    heartbeatFailureNotified: false,
    heartbeatInterval: null,
    isSettingDevice: false,
    lastRequestedDeviceId: null,
    panelOpened: false,
    playerState: defaultPlaybackState,
    queue: [],
    queueOpened: false,
    thisDeviceId: "",
    volumeLockUntil: 0,
  }),
});
