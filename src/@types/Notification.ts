export enum NotificationType {
  Warning,
  Success,
  Error,
}

export interface Notification {
  msg: string;
  type: NotificationType;
}
