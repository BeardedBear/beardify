import { watch } from "vue";

import { usePlayer } from "@/components/player/PlayerStore";
import { isTauri } from "@/helpers/platform";
import { clamp } from "@/helpers/volume";
import router, { RouteName } from "@/router";

type ThumbarAction = "next" | "play-pause" | "previous" | "vol-down" | "vol-up";

let initialized = false;

export async function initTauriBridge(): Promise<void> {
  if (!isTauri() || initialized) return;
  initialized = true;
  try {
    await setupDeepLink();
    await setupThumbarBridge();
    await setupWindowTitle();
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn("Tauri bridge init failed", e);
    }
  }
}

function handleAuthUrl(url: string): void {
  try {
    const parsed = new URL(url);
    const code = parsed.searchParams.get("code");
    if (code) router.push({ path: RouteName.Auth, query: { code } });
  } catch {
    // ignore malformed deep-link URLs
  }
}

async function setupDeepLink(): Promise<void> {
  const { getCurrent, onOpenUrl } = await import("@tauri-apps/plugin-deep-link");

  const [initial] = await Promise.all([
    getCurrent(),
    onOpenUrl((urls: string[]) => {
      if (urls.length > 0) handleAuthUrl(urls[0]);
    }),
  ]);

  if (initial && initial.length > 0) handleAuthUrl(initial[0]);
}

async function setupThumbarBridge(): Promise<void> {
  const [{ listen }, { invoke }] = await Promise.all([
    import("@tauri-apps/api/event"),
    import("@tauri-apps/api/core"),
  ]);
  const player = usePlayer();

  const actions: Record<ThumbarAction, () => void> = {
    next: () => player.next(),
    "play-pause": () => (player.playerState.paused ? player.play() : player.pause()),
    previous: () => player.previous(),
    "vol-down": () => player.setVolume(clamp((player.devices.activeDevice?.volume_percent ?? 50) - 2)),
    "vol-up": () => player.setVolume(clamp((player.devices.activeDevice?.volume_percent ?? 50) + 2)),
  };

  await listen<ThumbarAction>("thumbar-action", ({ payload }) => {
    actions[payload]?.();
  });

  watch(
    () => player.playerState.paused,
    (paused) => {
      invoke("set_play_state", { isPlaying: !paused }).catch(() => {
        // ignore; thumbar may not be installed yet
      });
    },
    { immediate: true },
  );
}

async function setupWindowTitle(): Promise<void> {
  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  const win = getCurrentWindow();
  const player = usePlayer();
  let lastTitle = "";

  const updateTitle = (): void => {
    const track = player.playerState.track_window.current_track;
    const title = track?.name ? `${track.artists.map((a) => a.name).join(", ")} — ${track.name}` : "Beardify";
    if (title === lastTitle) return;
    lastTitle = title;
    win.setTitle(title).catch(() => undefined);
  };

  player.$subscribe(updateTitle);
  updateTitle();
}
