<template>
  <Dialog title="Add an album to a collection" with-title>
    <div class="content">
      <BdInput
        v-if="collections.length > SEARCH_THRESHOLD"
        ref="searchInput"
        v-model="query"
        class="search"
        placeholder="Filter collections"
        size="small"
        type="search"
      />
      <BdEmptyState
        v-if="!filtered.length"
        :message="collections.length ? 'No collection matches that name.' : 'Create one from the sidebar first.'"
        :title="collections.length ? 'Nothing found' : 'No collection yet'"
      >
        <template #icon><i class="icon-search" /></template>
      </BdEmptyState>
      <button
        v-for="playlist in filtered"
        :key="playlist.id"
        :disabled="pendingId !== null"
        class="collection font-bold"
        type="button"
        @click="add(dialogStore.albumId ?? '', playlist.id)"
      >
        <span class="album">
          <span class="album-name">
            <PlaylistIcon :playlist="playlist" />
            {{ playlist.name.replace("#Collection ", "") }}
          </span>
          <BdLoader v-if="pendingId === playlist.id" size="small" />
          <VisibilityIcon v-else :playlist="playlist" />
        </span>
      </button>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { BdEmptyState, BdInput, BdLoader } from "bearded-ui";
import { computed, onMounted, ref, Ref } from "vue";

import { NotificationType } from "@/@types/Notification";
import { Paging } from "@/@types/Paging";
import { TrackSimplified } from "@/@types/Track";
import { instance } from "@/api";
import { useDialog } from "@/components/dialog/DialogStore";
import Dialog from "@/components/dialog/DialogWrap.vue";
import PlaylistIcon from "@/components/sidebar/PlaylistIcon.vue";
import { useSidebar } from "@/components/sidebar/SidebarStore";
import VisibilityIcon from "@/components/sidebar/VisibilityIcon.vue";
import { notification } from "@/helpers/notifications";
import { albumAllreadyExist } from "@/helpers/playlist";
import { useAuth } from "@/views/auth/AuthStore";

const dialogStore = useDialog();
const sidebarStore = useSidebar();
const authStore = useAuth();

/* Below this many collections a filter is more chrome than help. */
const SEARCH_THRESHOLD = 8;

const query = ref<string>("");
/* The collection whose existence check is in flight, so its row can say so. */
const pendingId = ref<null | string>(null);
const searchInput: Ref<InstanceType<typeof BdInput> | null> = ref(null);

const collections = computed(() =>
  sidebarStore.collections.filter(
    (playlist) => playlist.collaborative || playlist.owner.id === authStore.me?.id,
  ),
);

const filtered = computed(() => {
  const q = query.value.toLowerCase();
  return collections.value.filter((playlist) => playlist.name.toLowerCase().includes(q));
});

onMounted(() => searchInput.value?.focus());

async function add(albumId: string, playlistId: string): Promise<void> {
  /*
   * albumAllreadyExist paginates the whole target collection, which takes
   * seconds on a big one. Without this the row looked inert and got clicked
   * again.
   */
  pendingId.value = playlistId;
  try {
    if (await albumAllreadyExist(`playlists/${playlistId}/items?limit=50`, albumId)) {
      notification({
        msg: "This album is already in this collection",
        type: NotificationType.Error,
      });
      return;
    }
    const albumTracksResponse = await instance().get<Paging<TrackSimplified>>(`albums/${albumId}/tracks`);
    if (!albumTracksResponse.data.items.length) {
      notification({ msg: "Album has no tracks", type: NotificationType.Error });
      return;
    }
    await instance().post(`playlists/${playlistId}/items?uris=${albumTracksResponse.data.items[0].uri}`);
    dialogStore.close();
    notification({ msg: "Album added", type: NotificationType.Success });
  } catch (error: unknown) {
    notification({ msg: "Failed to add album", type: NotificationType.Error });
    if (import.meta.env.DEV) console.error("Add album error:", error);
  } finally {
    pendingId.value = null;
  }
}
</script>

<style scoped>

.content {
  padding: 0.5rem;
}

.album {
  align-items: center;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.album-name {
  align-items: center;
  display: flex;
  gap: 1rem;
}

.collection {
  background: none;
  border: 0;
  border-radius: 0.3rem;
  color: var(--font-color-dark);
  cursor: pointer;
  display: block;
  font-family: inherit;
  font-size: var(--font-size-sm);
  padding: 0.5rem 1rem;
  text-align: left;
  transition:
    background-color 0.1s ease,
    color 0.1s ease;
  width: 100%;

  &:disabled {
    cursor: progress;
  }

  &:hover:not(:disabled) {
    background: var(--bg-color-light);
    color: var(--font-color);
  }
}

.search {
  margin-bottom: 0.5rem;
  width: 100%;
}
</style>
