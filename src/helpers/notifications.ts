import { Notification } from "../@types/Notification";
import { useNotification } from "../components/notification/NotificationStore";

export function notification(notif: Notification): void {
  const notificationStore = useNotification();
  notificationStore.addNotification({ type: notif.type, msg: notif.msg }).then(() => {
    setTimeout(() => notificationStore.removeNotification(), 4000);
  });
}
