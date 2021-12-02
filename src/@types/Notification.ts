export enum NotificationType {
  Error,
  Success,
  Warning,
}
export interface NotificationStore {
  notifications: Notification[];
}

export interface Notification {
  type: NotificationType;
  msg: string;
}
