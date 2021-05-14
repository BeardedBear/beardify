import { ActionTree, MutationTree } from "vuex";
import { instance } from "../../api";
import { Player, defaultDevice } from "../../@types/Player";
import { RootState } from "../../@types/RootState";
import { CurrentlyPlaying } from "../../@types/CurrentlyPlaying";
import { defaultCurrentlyPlaying } from "../../@types/Defaults";
import { Device, DevicesResponse } from "../../@types/Device";

const state: Player = {
  devices: {
    activeDevice: defaultDevice,
    list: []
  },
  currentlyPlaying: defaultCurrentlyPlaying
};

// MUTATIONS

export enum Mutations {
  GET_DEVICE_LIST = "GET_DEVICE_LIST",
  SET_THIS_DEVICE = "SET_THIS_DEVICE",
  PLAYER_STATE_CHANGED = "PLAYER_STATE_CHANGED",
  SET_VOLUME = "SET_VOLUME",
  UPDATE_PROGRESS = "UPDATE_PROGRESS"
}

const mutations: MutationTree<Player> = {
  [Mutations.GET_DEVICE_LIST](state, data: Device[]): void {
    state.devices.list = data;
  },

  [Mutations.SET_THIS_DEVICE](state, data: Device): void {
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
  }
};

// ACTIONS

export enum PlayerActions {
  getDeviceList = "getDeviceList",
  setDevice = "setDevice",
  setVolume = "setVolume"
}

const actions: ActionTree<Player, RootState> = {
  [PlayerActions.getDeviceList](store) {
    instance.get<DevicesResponse>("me/player/devices").then(({ data }) => {
      // On set le dernier device actif par defaut
      const lastActiveDevice = data.devices.filter(el => el.name === store.state.devices.activeDevice.name).shift();
      const haveDeviceActive = data.devices.filter(d => d.is_active);

      if (!haveDeviceActive.length) {
        if (lastActiveDevice !== undefined) store.dispatch(PlayerActions.setDevice, lastActiveDevice);
      }

      // On met a jour la liste des devices
      store.commit(Mutations.GET_DEVICE_LIST, data.devices);
    });
  },

  [PlayerActions.setDevice](store, device: Device) {
    store.commit(Mutations.SET_THIS_DEVICE, device);
    instance.put("me/player", { device_ids: [device.id] });
  },

  [PlayerActions.setVolume](store, volume: number) {
    store.commit(Mutations.SET_VOLUME, volume);
    instance.put(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}`);
  }
};

export default {
  actions,
  mutations,
  namespaced: true,
  state
};
