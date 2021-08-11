import { ErrorType } from "../@types/Error";
import { Notification } from "../@types/Notification";
import { Mutations, NotificationActions } from "../components/notification/NotificationStore";
import store from "../store";

export function showError(type: ErrorType): void {
  store.dispatch(NotificationActions.addNotification, { type } as Notification).then(() => {
    setTimeout(() => {
      store.commit(Mutations.REMOVE_NOTIFICATION);
    }, 4000);
  });
}
