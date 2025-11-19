import { Notification } from "@/@types/Notification";
import { useNotification } from "@/components/notification/NotificationStore";

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
