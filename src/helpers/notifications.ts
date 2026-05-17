import { Notification } from "@/@types/Notification";
import { useNotification } from "@/components/notification/NotificationStore";

/**
 * Display a notification to the user and auto-dismiss it after 4 seconds.
 * @param notif - Notification object containing message and type (info, warning, error)
 */
export async function notification(notif: Notification): Promise<void> {
  const notificationStore = useNotification();
  try {
    await notificationStore.addNotification({ msg: notif.msg, type: notif.type });
  } finally {
    setTimeout(() => {
      notificationStore.removeNotification();
    }, 4000);
  }
}
