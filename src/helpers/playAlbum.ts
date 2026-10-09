import { usePlayer } from "@/components/player/PlayerStore";
import { startPlayback } from "@/helpers/apiErrorHandling";

/**
 * Play an album given its URI
 * @param albumUri The URI of the album to play
 */
export async function playAlbum(albumUri: string): Promise<void> {
  usePlayer().playerState.position = 0;
  await startPlayback({ context_uri: albumUri, position_ms: 0 });
}
