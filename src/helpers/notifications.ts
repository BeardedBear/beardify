import { Notification } from "../@types/Notification";
import { useNotification } from "../components/notification/NotificationStore";

export function notification(notif: Notification): void {
  const notificationStore = useNotification();
  notificationStore.addNotification({ msg: notif.msg, type: notif.type }).then(() => {
    setTimeout(() => {
      notificationStore.removeNotification();
    }, 4000);
  });
}
