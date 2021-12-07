import { usePlayer } from "../components/player/PlayerStore";

export function syncOfficialSpotifyClient(): void {
  if (usePlayer().thisDeviceId !== usePlayer().currentlyPlaying.device.id) {
    setTimeout(() => usePlayer().getPlayerState(), 1000);
  }
}
