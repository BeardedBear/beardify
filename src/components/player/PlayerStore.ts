import { ActionTree, MutationTree } from "vuex";
import { CurrentlyPlaying } from "../../@types/CurrentlyPlaying";
import { defaultCurrentlyPlaying, defaultDevice } from "../../@types/Defaults";
import { Device, DevicesResponse } from "../../@types/Device";
import { Player } from "../../@types/Player";
import { RootState } from "../../@types/RootState";
import { api, instance } from "../../api";
import router from "../../router";

const state: Player = {
  devices: {
    activeDevice: defaultDevice,
    list: [],
  },
  thisDeviceId: "",
  currentlyPlaying: defaultCurrentlyPlaying,
};

// MUTATIONS

export enum Mutations {
  GET_DEVICE_LIST = "GET_DEVICE_LIST",
  SET_ACTIVE_DEVICE = "SET_ACTIVE_DEVICE",
  PLAYER_STATE_CHANGED = "PLAYER_STATE_CHANGED",
  SET_VOLUME = "SET_VOLUME",
  UPDATE_PROGRESS = "UPDATE_PROGRESS",
  THIS_DEVICE = "THIS_DEVICE",
}

const mutations: MutationTree<Player> = {
  [Mutations.GET_DEVICE_LIST](state, data: Device[]): void {
    state.devices.list = data;
  },

  [Mutations.SET_ACTIVE_DEVICE](state, data: Device): void {
    state.devices.activeDevice = data;
  },

  [Mutations.PLAYER_STATE_CHANGED](state, customEvent: CurrentlyPlaying): void {
    state.devices.activeDevice = customEvent.device;
    state.currentlyPlaying = customEvent;
  },

  [Mutations.SET_VOLUME](state, volume: number): void {
    state.devices.activeDevice.volume_percent = volume;
  },

  [Mutations.UPDATE_PROGRESS](state, progress: number): void {
    state.currentlyPlaying.progress_ms = progress;
  },

  [Mutations.THIS_DEVICE](state, deviceId: string): void {
    state.thisDeviceId = deviceId;
  },
};

// ACTIONS

export enum PlayerActions {
  getDeviceList = "getDeviceList",
  setDevice = "setDevice",
  setVolume = "setVolume",
  getPlayerState = "getPlayerState",
  toggleShuffle = "toggleShuffle",
  toggleRepeat = "toggleRepeat",
}

const actions: ActionTree<Player, RootState> = {
  [PlayerActions.getDeviceList](store) {
    instance.get<DevicesResponse>("me/player/devices").then(({ data }) => {
      store.commit(Mutations.GET_DEVICE_LIST, data.devices);
    });
  },

  [PlayerActions.setDevice](store, device: Device) {
    store.commit(Mutations.SET_ACTIVE_DEVICE, device);
    instance.put("me/player", { device_ids: [device.id] });
  },

  [PlayerActions.setVolume](store, volume: number) {
    instance.put(`me/player/volume?volume_percent=${volume}`).then(() => store.commit(Mutations.SET_VOLUME, volume));
  },

  [PlayerActions.getPlayerState](store) {
    instance
      .get(`me/player`)
      .then((e) => {
        if (e.status === 401) router.push("login");
        store.commit(Mutations.PLAYER_STATE_CHANGED, e.data);
      })
      .catch((e) => console.error(e));
  },

  [PlayerActions.toggleShuffle](store) {
    if (store.state.currentlyPlaying.shuffle_state) {
      instance.put(`${api.url}me/player/shuffle?state=false`);
    } else {
      instance.put(`${api.url}me/player/shuffle?state=true`);
    }
  },

  [PlayerActions.toggleRepeat](store) {
    if (store.state.currentlyPlaying.repeat_state === "off") {
      instance.put(`${api.url}me/player/repeat?state=context`);
    } else {
      instance.put(`${api.url}me/player/repeat?state=off`);
    }
  },
};

export default {
  actions,
  mutations,
  state,
};
