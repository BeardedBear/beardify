import { BdToastVariant, toast } from "bearded-ui";

import { Notification, NotificationType } from "@/@types/Notification";

const variants: Record<NotificationType, BdToastVariant> = {
  [NotificationType.Error]: "danger",
  [NotificationType.Success]: "success",
  [NotificationType.Warning]: "warning",
};

/**
 * Display a notification to the user. Rendering and auto-dismiss are handled by
 * the `BdToaster` mounted in `App.vue`.
 * @param notif - Notification object containing message and type (info, warning, error)
 */
export function notification(notif: Notification): void {
  toast(notif.msg, { variant: variants[notif.type] });
}
