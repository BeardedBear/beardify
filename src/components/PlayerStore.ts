import { playlist } from "@/fake-playlist";
import { ActionContext, ActionTree, MutationTree } from "vuex";
import { instance } from "@/api";
import { AxiosResponse } from "axios";

const state = {
  devices: {
    thisDevice: "",
    list: []
  },
  playlist: playlist,
  currentlyPlaying: {
    index: 0,
    track: {
      duration: 0,
      position: 0
    },
    item: playlist[0]
  }
};

// MUTATIONS

export enum Mutations {
  NEXT = "NEXT",
  GET_DEVICE_LIST = "GET_DEVICE_LIST",
  SET_THIS_DEVICE = "SET_THIS_DEVICE",
  PLAYER_STATE_CHANGED = "PLAYER_STATE_CHANGED"
}

const mutations: MutationTree<Player> = {
  [Mutations.NEXT](state, id: number): void {
    // const inc = (state.currentlyPlaying.index += 1);
    state.currentlyPlaying.index = id;
    state.currentlyPlaying.item = playlist[id];
  },

  [Mutations.GET_DEVICE_LIST](state, data: Device[]): void {
    state.devices.list = data;
  },

  [Mutations.SET_THIS_DEVICE](state, data: string): void {
    state.devices.thisDevice = data;
  },

  [Mutations.PLAYER_STATE_CHANGED](state, customEvent: Track): void {
    state.currentlyPlaying.track.duration = customEvent.duration;
    state.currentlyPlaying.track.position = Math.round(customEvent.position);
  }
};

// ACTIONS

export enum PlayerActions {
  next = "next",
  getDeviceList = "getDeviceList",
  setThisDevice = "setThisDevice",
  playerStateChanged = "playerStateChanged"
}

const actions: ActionTree<Player, RootState> = {
  [PlayerActions.next](store, id: number) {
    store.commit(Mutations.NEXT, id);
  },

  [PlayerActions.getDeviceList](store) {
    instance
      .get<Device[]>("me/player/devices")
      .then((e: AxiosResponse) => store.commit(Mutations.GET_DEVICE_LIST, e.data.devices));
  },

  [PlayerActions.setThisDevice](store, thisDevice: string) {
    store.commit(Mutations.SET_THIS_DEVICE, thisDevice);
  },

  [PlayerActions.playerStateChanged](store, customEvent: Track) {
    store.commit(Mutations.PLAYER_STATE_CHANGED, customEvent);
  }
};

export default {
  actions,
  mutations,
  namespaced: true,
  state
};
