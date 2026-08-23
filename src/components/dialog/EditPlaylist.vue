<template>
  <Dialog :title="`Edit a ${isCollection ? 'collection' : 'playlist'}`" with-title>
    <div v-if="values.name === ''" class="loading">
      <BdLoader />
    </div>
    <div v-else class="wrap">
      <div>
        <div class="section">
          <label for="name">Name</label>
          <BdInput v-if="isEditable" id="name" v-model="values.name" />
          <div v-else>
            {{ values.name }}
          </div>
        </div>
        <div class="section">
          <label for="description">Description</label>
          <textarea
            v-if="isEditable"
            id="description"
            v-model="values.description"
            class="textarea"
            placeholder="Add description"
          />
          <div v-else>
            {{ values.description }}
          </div>
        </div>
        <div v-if="isEditable" class="option-list section">
          <div class="option">
            <label for="public">Visibility</label>
            <BdButtonGroup v-model="visibility" :options="visibilityOptions" />
          </div>
        </div>
        <RankingModeEditor
          v-if="isEditable && isCollection"
          v-model="values.rankingMode"
          :description-text="values.description"
        />
      </div>
      <div class="actions">
        <BdButton @click="remove()">Delete {{ isCollection ? "collection" : "playlist" }}</BdButton>
        <BdButton
          v-if="isEditable"
          variant="primary"
          @click="dialogStore.updatePlaylist(values, dialogStore.playlistId, isCollection)"
        >
          Confirm
        </BdButton>
      </div>
      <div v-if="isTouchDevice()" class="bottom">
        <p>Share content</p>
        <ShareContent :beardify-url="$route.fullPath" :spotify-url="playlistStore.playlist.external_urls.spotify" />
      </div>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { BdButton, BdButtonGroup, BdInput, BdLoader, BdOption } from "bearded-ui";
import { computed, reactive, ref, watchEffect } from "vue";

import { UpdatePlaylistValues } from "@/@types/Dialog";
import { NotificationType } from "@/@types/Notification";
import { Playlist } from "@/@types/Playlist";
import { instance } from "@/api";
import { useDialog } from "@/components/dialog/DialogStore";
import Dialog from "@/components/dialog/DialogWrap.vue";
import RankingModeEditor from "@/components/dialog/RankingModeEditor.vue";
import { useSidebar } from "@/components/sidebar/SidebarStore";
import { parseCollectionRankingMode, stripCollectionTags } from "@/helpers/collectionOptions";
import { isACollection } from "@/helpers/isCollection";
import { isTouchDevice } from "@/helpers/isTouchDevice";
import { notification } from "@/helpers/notifications";
import { useAuth } from "@/views/auth/AuthStore";
import { usePlaylist } from "@/views/playlist/PlaylistStore";

import ShareContent from "../ui/ShareContent.vue";

const dialogStore = useDialog();
const playlistStore = usePlaylist();
const sidebarStore = useSidebar();
const values: UpdatePlaylistValues = reactive({
  collaborative: false,
  description: "",
  name: "",
  public: false,
  rankingMode: { type: "off" },
});
const isCollection = ref<boolean>(false);
const isEditable = ref<boolean>(false);

const visibilityOptions: BdOption[] = [
  { label: "Public", value: "public" },
  { label: "Private", value: "private" },
  { label: "Collaborative", value: "collaborative" },
];

// Spotify encodes visibility as two booleans; the segmented control needs one value.
const visibility = computed<string>({
  get: () => {
    if (values.collaborative) return "collaborative";
    return values.public ? "public" : "private";
  },
  set: (value) => {
    values.collaborative = value === "collaborative";
    values.public = value === "public";
  },
});

watchEffect(async () => {
  if (dialogStore.show && dialogStore.type === "editPlaylist") {
    try {
      const { data } = await instance().get<Playlist>(`playlists/${dialogStore.playlistId}`);
      isEditable.value = data.owner.id === useAuth().me?.id;
      isCollection.value = isACollection(data);
      values.name = data.name;
      const cleanDescription = stripCollectionTags(data.description);
      values.description = cleanDescription === "No description" ? "" : cleanDescription;
      values.public = data.public;
      values.collaborative = data.collaborative;
      values.rankingMode = parseCollectionRankingMode(data.description);
    } catch {
      notification({ msg: "Unable to load playlist details", type: NotificationType.Error });
    }
  }
});

function remove(): void {
  if (dialogStore.playlistId) {
    // First close the dialog to avoid rendering issues
    const playlistIdToDelete = dialogStore.playlistId;
    dialogStore.close();

    // Wait for the closing animation to complete before deleting
    setTimeout(async () => {
      try {
        await sidebarStore.removePlaylist(playlistIdToDelete);
      } catch (error) {
        if (import.meta.env.DEV) console.error("Error while deleting playlist:", error);
        notification({ msg: "Unable to delete playlist", type: NotificationType.Error });
      }
    }, 300); // Slightly longer than the closing animation (200ms)
  }
}
</script>

<style scoped>

.loading {
  display: grid;
  height: 10rem;
  place-content: center;
}

@keyframes pop-wrap {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.bottom {
  border-top: 0.1rem solid var(--bg-color-light);
  margin-top: 1rem;

  p {
    font-variation-settings: var(--font-variation-settings-bold);
    font-weight: var(--font-weight-bold);
    margin-bottom: 0.5rem;
  }
}

.wrap {
  animation: pop-wrap 0.5s ease 0.1s both;
  padding: 1.2rem;
}

.option-list {
  display: flex;
  justify-content: space-between;

  .option {
    flex: 1;
  }
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 3rem;
}

label {
  display: block;
  font-style: italic;
  margin-bottom: 0.3rem;
  opacity: 0.6;
  width: 100%;
}

.section {
  margin-bottom: 1rem;
}

.textarea {
  background-color: var(--bg-color-light);
  border: none;
  border-radius: 0.4rem;
  color: var(--font-color);
  font-variation-settings: var(--font-variation-settings-bold);
  font-weight: var(--font-weight-bold);
  min-height: 5rem;
  outline: 0;
  padding: 0.8rem 1rem;
  resize: vertical;
  transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  width: 100%;

  &::placeholder {
    color: var(--font-color-dark);
    font-style: var(--font-style-italic);
    font-variation-settings: var(--font-variation-settings-italic);
  }

  &:focus {
    box-shadow: 0 0 0 0.1rem var(--primary-color);
  }
}
</style>
