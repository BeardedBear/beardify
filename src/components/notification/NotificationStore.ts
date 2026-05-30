import { defineStore } from "pinia";

import { Notification, NotificationStore } from "@/@types/Notification";

// Module-level counter guarantees a stable, unique id per notification so the
// component can key by id and removal targets the exact entry (not FIFO).
let nextNotificationId = 0;

export const useNotification = defineStore("notification", {
  actions: {
    addNotification(notif: Notification): number {
      const id = nextNotificationId++;
      this.notifications = [...this.notifications, { ...notif, id }];
      return id;
    },

    removeNotification(id: number) {
      this.notifications = this.notifications.filter((n) => n.id !== id);
    },
  },

  state: (): NotificationStore => ({
    notifications: [],
  }),
});
