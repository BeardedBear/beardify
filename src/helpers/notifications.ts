import { BdToastVariant, toast } from "bearded-ui";

import { Notification, NotificationType } from "@/@types/Notification";

const variants: Record<NotificationType, BdToastVariant> = {
  [NotificationType.Error]: "danger",
  [NotificationType.Success]: "success",
  [NotificationType.Warning]: "warning",
};

/**
 * Long enough to notice a mis-click and reach the toast, short enough that it
 * is gone before the next gesture. Spotify has no trash, so this window is the
 * only safety net a collection gets.
 */
const UNDO_WINDOW_MS = 8000;

/**
 * Display a notification to the user. Rendering and auto-dismiss are handled by
 * the `BdToaster` mounted in `App.vue`.
 * @param notif - Notification object containing message and type (info, warning, error)
 */
export function notification(notif: Notification): void {
  toast(notif.msg, { variant: variants[notif.type] });
}

/**
 * Confirms a destructive action and offers to take it back.
 *
 * The library dismisses the toast before running `restore`, so a slow request
 * cannot leave a live button on screen or fire twice. A failed restore is
 * surfaced here rather than swallowed: the row is already gone from the UI, so
 * silence would leave the user believing it came back.
 * @param msg - What just happened, in the past tense — "Removed Kid A"
 * @param restore - Puts it back
 */
export function notifyUndoable(msg: string, restore: () => Promise<void>): void {
  toast(msg, {
    action: {
      label: "Undo",
      onAction: async (): Promise<void> => {
        try {
          await restore();
        } catch {
          notification({
            msg: "Could not restore — reload to see the current state",
            type: NotificationType.Error,
          });
        }
      },
    },
    duration: UNDO_WINDOW_MS,
  });
}
