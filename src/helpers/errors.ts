import { ErrorType } from "../@types/Error";
import { useNotification } from "../components/notification/NotificationStore";

export function showError(type: ErrorType): void {
  const notificationStore = useNotification();
  notificationStore.addNotification({ type }).then(() => {
    setTimeout(() => notificationStore.removeNotification(), 4000);
  });
}
