<template>
  <Dialog :title="`Edit a ${isCollection ? 'collection' : 'playlist'}`" with-title>
    <div class="loading" v-if="values.name === ''"><Loading /></div>
    <div class="wrap" v-else>
      <div>
        <div class="section">
          <label for="name">Name</label>
          <input class="input" id="name" type="text" v-if="isEditable" v-model="values.name" />
          <div v-else>{{ values.name }}</div>
        </div>
        <div class="section">
          <label for="description">Description</label>
          <textarea
            class="textarea"
            id="description"
            placeholder="Add description"
            v-if="isEditable"
            v-model="values.description"
          ></textarea>
          <div v-else>{{ values.description }}</div>
        </div>
        <div class="option-list section" v-if="isEditable">
          <div class="option">
            <label for="public">Visibility</label>
            <div class="buttons">
              <button
                :class="{
                  'button--primary': values.public && !values.collaborative,
                }"
                @click="
                  () => {
                    values.collaborative = false;
                    values.public = true;
                  }
                "
                class="button"
              >
                Public
              </button>
              <button
                :class="{
                  'button--primary': !values.public && !values.collaborative,
                }"
                @click="
                  () => {
                    values.collaborative = false;
                    values.public = false;
                  }
                "
                class="button"
              >
                Private
              </button>
              <button
                :class="{
                  'button--primary': values.collaborative && !values.public,
                }"
                @click="
                  () => {
                    values.collaborative = true;
                    values.public = false;
                  }
                "
                class="button"
              >
                Collaborative
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="actions">
        <button @click="remove()" class="button button">Delete {{ isCollection ? "collection" : "playlist" }}</button>
        <button
          @click="dialogStore.updatePlaylist(values, dialogStore.playlistId, isCollection)"
          class="button button--primary"
          v-if="isEditable"
        >
          Confirm
        </button>
      </div>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { reactive, ref, watchEffect } from "vue";

import { UpdatePlaylistValues } from "../../@types/Dialog";
import { NotificationType } from "../../@types/Notification";
import { Playlist } from "../../@types/Playlist";
import { instance } from "../../api";
import { notification } from "../../helpers/notifications";
import { useAuth } from "../../views/auth/AuthStore";
import Loading from "../LoadingDots.vue";
import { useSidebar } from "../sidebar/SidebarStore";
import { useDialog } from "./DialogStore";
import Dialog from "./DialogWrap.vue";

const dialogStore = useDialog();
const sidebarStore = useSidebar();
const values: UpdatePlaylistValues = reactive({
  collaborative: false,
  description: "",
  name: "",
  public: false,
});
const isCollection = ref<boolean>(false);
const isEditable = ref<boolean>(false);

watchEffect(() => {
  if (dialogStore.show && dialogStore.type === "editPlaylist") {
    instance()
      .get<Playlist>(`playlists/${dialogStore.playlistId}`)
      .then(({ data }) => {
        isEditable.value = data.owner.id === useAuth().me?.id;
        isCollection.value = data.name.toLowerCase().startsWith("#collection");
        values.name = data.name.replaceAll("#Collection ", "");
        values.description = data.description === "" || data.description === "No description" ? "" : data.description;
        values.public = data.public;
        values.collaborative = data.collaborative;
      });
  }
});

function remove(): void {
  if (dialogStore.playlistId) {
    // First close the dialog to avoid rendering issues
    const playlistIdToDelete = dialogStore.playlistId;
    dialogStore.close();

    // Wait for the closing animation to complete before deleting
    setTimeout(() => {
      sidebarStore.removePlaylist(playlistIdToDelete).catch((error) => {
        // eslint-disable-next-line no-console
        console.error("Error while deleting playlist:", error);
        notification({ msg: `Unable to delete playlist`, type: NotificationType.Error });
      });
    }, 300); // Slightly longer than the closing animation (200ms)
  }
}
</script>

<style lang="scss" scoped>
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

.buttons {
  display: flex;
  gap: 0.5rem;
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
  min-height: 5rem;
  resize: vertical;
}

.input,
.textarea {
  background-color: var(--bg-color-light);
  border: none;
  border-radius: 0.4rem;
  color: var(--font-color);
  font-weight: bold;
  outline: 0;
  padding: 0.8rem 1rem;
  transition: 0.2s;
  width: 100%;

  &::placeholder {
    color: var(--font-color);
    font-style: italic;
    font-weight: normal;
    opacity: 0.2;
  }

  &:focus {
    box-shadow: 0 0 0 0.1rem var(--primary-color);
  }
}
</style>
