import { ActionTree, MutationTree } from "vuex";
import { api, instance } from "../../api";
import { Player } from "../../@types/Player";
import { RootState } from "../../@types/RootState";
import { CurrentlyPlaying } from "../../@types/CurrentlyPlaying";
import { defaultCurrentlyPlaying, defaultDevice } from "../../@types/Defaults";
import { Device, DevicesResponse } from "../../@types/Device";

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
}

const actions: ActionTree<Player, RootState> = {
  [PlayerActions.getDeviceList](store) {
    instance.get<DevicesResponse>("me/player/devices").then(({ data }) => {
      // const haveDeviceActive = data.devices.filter(d => d.is_active);
      // const beardifyDevice = data.devices.filter(d => d.name === "Beardify").shift();

      store.commit(Mutations.GET_DEVICE_LIST, data.devices);

      // if (haveDeviceActive.length) {
      //   store.dispatch(PlayerActions.setDevice, haveDeviceActive[0]);
      // }
    });
  },

  [PlayerActions.setDevice](store, device: Device) {
    store.commit(Mutations.SET_ACTIVE_DEVICE, device);
    instance.put("me/player", { device_ids: [device.id] });
  },

  [PlayerActions.setVolume](store, volume: number) {
    store.commit(Mutations.SET_VOLUME, volume);
    instance.put(`${api.url}me/player/volume?volume_percent=${volume}`);
  },
};

export default {
  actions,
  mutations,
  namespaced: true,
  state,
};
