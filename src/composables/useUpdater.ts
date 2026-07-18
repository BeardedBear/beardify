import { type Ref, ref } from "vue";

type DownloadEvent = { data: { chunkLength: number; contentLength?: number }; event: string };

interface UpdaterState {
  checkForUpdate: () => Promise<void>;
  dismissed: Ref<boolean>;
  downloadAndInstall: () => Promise<void>;
  downloadProgress: Ref<number>;
  errorMessage: Ref<null | string>;
  restart: () => Promise<void>;
  status: Ref<UpdateStatus>;
  updateVersion: Ref<null | string>;
}

type UpdateStatus = "available" | "checking" | "downloading" | "error" | "idle" | "ready";

const dismissed = ref(false);
const downloadProgress = ref(0);
const errorMessage = ref<null | string>(null);
const status = ref<UpdateStatus>("idle");
const updateVersion = ref<null | string>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pendingUpdate: any = null;

export function useUpdater(): UpdaterState {
  return {
    checkForUpdate,
    dismissed,
    downloadAndInstall,
    downloadProgress,
    errorMessage,
    restart,
    status,
    updateVersion,
  };
}

async function checkForUpdate(): Promise<void> {
  status.value = "checking";
  dismissed.value = false;
  try {
    const { check } = await import("@tauri-apps/plugin-updater");
    const update = await check();
    if (update) {
      pendingUpdate = update;
      updateVersion.value = update.version;
      status.value = "available";
    } else {
      status.value = "idle";
    }
  } catch (e) {
    errorMessage.value = toMessage(e);
    status.value = "error";
  }
}

async function downloadAndInstall(): Promise<void> {
  if (!pendingUpdate) return;
  status.value = "downloading";
  downloadProgress.value = 0;
  let downloaded = 0;
  let total = 0;
  try {
    await pendingUpdate.downloadAndInstall((event: DownloadEvent) => {
      if (event.event === "Started") {
        total = event.data.contentLength ?? 0;
      } else if (event.event === "Progress") {
        downloaded += event.data.chunkLength;
        downloadProgress.value = total > 0 ? Math.round((downloaded / total) * 100) : 0;
      } else if (event.event === "Finished") {
        downloadProgress.value = 100;
        status.value = "ready";
      }
    });
  } catch (e) {
    errorMessage.value = toMessage(e);
    status.value = "error";
  }
}

async function restart(): Promise<void> {
  const { relaunch } = await import("@tauri-apps/plugin-process");
  await relaunch();
}

function toMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
