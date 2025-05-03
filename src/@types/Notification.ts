export enum NotificationType {
  Warning,
  Success,
  Error,
}
export interface Notification {
  msg: string;
  type: NotificationType;
}

export interface NotificationStore {
  notifications: Notification[];
}
