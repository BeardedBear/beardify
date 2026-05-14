import { check, type Update } from "@tauri-apps/plugin-updater";
import { type Ref, ref } from "vue";

interface UpdaterState {
  checkForUpdate: () => Promise<void>;
  dismissed: Ref<boolean>;
  downloadAndInstall: () => Promise<void>;
  downloadProgress: Ref<number>;
  errorMessage: Ref<null | string>;
  status: Ref<UpdateStatus>;
  updateVersion: Ref<null | string>;
}

type UpdateStatus = "available" | "checking" | "downloading" | "error" | "idle" | "ready";

const dismissed = ref(false);
const downloadProgress = ref(0);
const errorMessage = ref<null | string>(null);
const status = ref<UpdateStatus>("idle");
const updateVersion = ref<null | string>(null);
let pendingUpdate: null | Update = null;

export function useUpdater(): UpdaterState {
  return {
    checkForUpdate,
    dismissed,
    downloadAndInstall,
    downloadProgress,
    errorMessage,
    status,
    updateVersion,
  };
}

async function checkForUpdate(): Promise<void> {
  status.value = "checking";
  dismissed.value = false;
  try {
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
    await pendingUpdate.downloadAndInstall((event) => {
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

function toMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
