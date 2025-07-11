import { NotificationType } from "../@types/Notification";
import { usePlayer } from "../components/player/PlayerStore";
import { ensureActiveDevice, executePlaybackApiCall } from "../helpers/apiErrorHandling";
import { notification } from "../helpers/notifications";

/**
 * Play an album given its URI
 * @param albumUri The URI of the album to play
 */
export async function playAlbum(albumUri: string): Promise<void> {
  usePlayer().playerState.position = 0;

  const deviceId = await ensureActiveDevice();

  if (!deviceId) {
    notification({
      msg: "No active device found. Please select a device.",
      type: NotificationType.Warning,
    });
    return;
  }

  const payload = { context_uri: albumUri, position_ms: 0 };

  await executePlaybackApiCall(deviceId, payload);
}
