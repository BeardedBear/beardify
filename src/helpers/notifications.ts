import { Notification } from "@/@types/Notification";
import { useNotification } from "@/components/notification/NotificationStore";

/**
 * Display a notification to the user and auto-dismiss it after 4 seconds.
 * @param notif - Notification object containing message and type (info, warning, error)
 */
export function notification(notif: Notification): void {
  const notificationStore = useNotification();
  const id = notificationStore.addNotification({ msg: notif.msg, type: notif.type });
  setTimeout(() => {
    notificationStore.removeNotification(id);
  }, 4000);
}
