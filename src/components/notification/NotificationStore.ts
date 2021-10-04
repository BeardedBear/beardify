import { defineStore } from "pinia";
import { Notification, NotificationStore } from "../../@types/Notification";

export const useNotification = defineStore("notification", {
  state: (): NotificationStore => ({
    notifications: [],
  }),

  actions: {
    async addNotification(notif: Notification) {
      this.notifications = [...this.notifications, notif];
    },

    removeNotification() {
      this.notifications.shift();
    },
  },
});
