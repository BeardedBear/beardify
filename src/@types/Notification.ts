export enum NotificationType {
  Warning,
  Success,
  Error,
}
export interface DisplayedNotification extends Notification {
  id: number;
}

export interface Notification {
  msg: string;
  type: NotificationType;
}

export interface NotificationStore {
  notifications: DisplayedNotification[];
}
