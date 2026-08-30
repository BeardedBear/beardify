import { usePlayer } from "@/components/player/PlayerStore";
import { ensureActiveDevice, executePlaybackApiCall, notifyNoDevice } from "@/helpers/apiErrorHandling";

/**
 * Play an album given its URI
 * @param albumUri The URI of the album to play
 */
export async function playAlbum(albumUri: string): Promise<void> {
  usePlayer().playerState.position = 0;

  const deviceId = await ensureActiveDevice();

  if (!deviceId) {
    notifyNoDevice();
    return;
  }

  const payload = { context_uri: albumUri, position_ms: 0 };

  await executePlaybackApiCall(deviceId, payload);
}
