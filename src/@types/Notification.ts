import { ErrorType } from "./Error";

export interface NotificationStore {
  notifications: Notification[];
}

export interface Notification {
  type: ErrorType;
}
