export enum NotificationType {
  Warning,
  Success,
  Error,
}
export interface NotificationStore {
  notifications: Notification[];
}

export interface Notification {
  msg: string;
  type: NotificationType;
}
