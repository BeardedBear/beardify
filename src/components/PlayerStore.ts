import { ActionTree, MutationTree } from "vuex";
import { instance } from "../api";
import { Player, defaultTrack, Track } from "../@types/Player";
import { RootState } from "../@types/rootStore";

const state: Player = {
  devices: {
    activeDevice: {
      id: null,
      is_active: false,
      is_restricted: false,
      name: "",
      type: "",
      volume_percent: null
    },
    list: []
  },
  currentlyPlaying: {
    track: defaultTrack
  }
};

// MUTATIONS

export enum Mutations {
  GET_DEVICE_LIST = "GET_DEVICE_LIST",
  SET_THIS_DEVICE = "SET_THIS_DEVICE",
  PLAYER_STATE_CHANGED = "PLAYER_STATE_CHANGED"
}

const mutations: MutationTree<Player> = {
  [Mutations.GET_DEVICE_LIST](state, data: UserDevice[]): void {
    state.devices.list = data;
  },

  [Mutations.SET_THIS_DEVICE](state, data: UserDevice): void {
    state.devices.activeDevice = data;
  },

  [Mutations.PLAYER_STATE_CHANGED](state, customEvent: Track): void {
    state.currentlyPlaying.track.duration = customEvent.duration;
    state.currentlyPlaying.track.position = Math.round(customEvent.position);
    state.currentlyPlaying.track.paused = customEvent.paused;
    state.currentlyPlaying.track.repeatMode = customEvent.repeatMode;
    state.currentlyPlaying.track.shuffle = customEvent.shuffle;
    state.currentlyPlaying.track.trackWindow = customEvent.trackWindow;
  }
};

// ACTIONS

export enum PlayerActions {
  getDeviceList = "getDeviceList",
  setDevice = "setDevice"
}

const actions: ActionTree<Player, RootState> = {
  [PlayerActions.getDeviceList](store) {
    instance.get<UserDevicesResponse>("me/player/devices").then(({ data }) => {
      // On set le dernier device actif par defaut
      const lastActiveDevice = data.devices.filter(el => el.name === store.state.devices.activeDevice.name);
      if (lastActiveDevice[0] !== undefined) store.dispatch(PlayerActions.setDevice, lastActiveDevice[0]);

      // On met a jour la liste des devices
      store.commit(Mutations.GET_DEVICE_LIST, data.devices);
    });
  },

  [PlayerActions.setDevice](store, device: UserDevice) {
    store.commit(Mutations.SET_THIS_DEVICE, device);
    instance.put("me/player", { device_ids: [device.id] });
  }
};

export default {
  actions,
  mutations,
  namespaced: true,
  state
};
