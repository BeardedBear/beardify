import { ActionTree, MutationTree } from "vuex";
import { Notification, NotificationStore } from "../../@types/Notification";
import { RootState } from "../../@types/RootState";

const state: NotificationStore = {
  notifications: [],
};

// MUTATIONS

export enum Mutations {
  ADD_NOTIFICATION = "ADD_NOTIFICATION",
  REMOVE_NOTIFICATION = "REMOVE_NOTIFICATION",
}

const mutations: MutationTree<NotificationStore> = {
  [Mutations.ADD_NOTIFICATION](state, notification: Notification): void {
    state.notifications = [...state.notifications, notification];
  },

  [Mutations.REMOVE_NOTIFICATION](state): void {
    state.notifications.shift();
  },
};

// ACTIONS

export enum NotificationActions {
  addNotification = "addNotification",
}

const actions: ActionTree<NotificationStore, RootState> = {
  [NotificationActions.addNotification](store, notif: Notification): void {
    store.commit(Mutations.ADD_NOTIFICATION, notif);
  },
};

export default {
  actions,
  mutations,
  state,
};
