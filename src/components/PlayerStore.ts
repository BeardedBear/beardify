import { ActionTree, MutationTree } from "vuex";
import { instance } from "@/api";
import { AxiosResponse } from "axios";
import { Player, defaultTrack, Device, Track } from "@/@types/Player";
import { RootState } from "@/@types/rootStore";

const state: Player = {
  devices: {
    thisDevice: "",
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
  [Mutations.GET_DEVICE_LIST](state, data: Device[]): void {
    state.devices.list = data;
  },

  [Mutations.SET_THIS_DEVICE](state, data: string): void {
    state.devices.thisDevice = data;
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
  getDeviceList = "getDeviceList"
}

const actions: ActionTree<Player, RootState> = {
  [PlayerActions.getDeviceList](store) {
    instance
      .get<Device[]>("me/player/devices")
      .then((e: AxiosResponse) => store.commit(Mutations.GET_DEVICE_LIST, e.data.devices))
      .then(() => instance.put("me/player", { device_ids: [store.state.devices.thisDevice] }));
  }
};

export default {
  actions,
  mutations,
  namespaced: true,
  state
};
