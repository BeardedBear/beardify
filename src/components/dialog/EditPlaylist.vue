<template>
  <Dialog with-title title="Editer une playlist">
    <div class="wrap">
      <div>
        <div class="section">
          <label for="name">Nom</label> <input id="name" v-model="values.name" class="input" type="text" />
        </div>
        <div class="section">
          <label for="description">Description</label>
          <textarea id="description" v-model="values.description" class="textarea"></textarea>
        </div>
        <div class="option-list section">
          <div class="option">
            <label for="public">Visibilité</label>
            <button
              class="button"
              :class="{ 'button--primary': values.public && !values.collaborative }"
              @click="
                () => {
                  values.collaborative = false;
                  values.public = true;
                }
              "
            >
              Publique
            </button>
            <button
              class="button"
              :class="{ 'button--primary': !values.public && !values.collaborative }"
              @click="
                () => {
                  values.collaborative = false;
                  values.public = false;
                }
              "
            >
              Privée
            </button>
            <button
              class="button"
              :class="{ 'button--primary': values.collaborative && !values.public }"
              @click="
                () => {
                  values.collaborative = true;
                  values.public = false;
                }
              "
            >
              Collaborative
            </button>
          </div>
        </div>
      </div>
      <div class="actions">
        <button class="button button" @click="remove()">Supprimer la playlist</button>
        <button
          class="button button--primary"
          @click="dialogStore.updatePlaylist(values, dialogStore.playlistId, isCollection)"
        >
          Valider
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
import { useSidebar } from "../sidebar/SidebarStore";
import Dialog from "./Dialog.vue";
import { useDialog } from "./DialogStore";

const dialogStore = useDialog();
const sidebarStore = useSidebar();
const values: UpdatePlaylistValues = reactive({ name: "", collaborative: false, description: "", public: false });
const isCollection = ref<boolean>(false);

watchEffect(() => {
  if (dialogStore.show && dialogStore.type === "editPlaylist") {
    instance()
      .get<Playlist>(`playlists/${dialogStore.playlistId}`)
      .then(({ data }) => {
        isCollection.value = data.name.toLowerCase().startsWith("#collection");
        values.name = data.name.replaceAll("#Collection ", "");
        values.description = data.description;
        values.public = data.public;
        values.collaborative = data.collaborative;
      });
  }
});

function remove(): void {
  if (dialogStore.playlistId) {
    sidebarStore.removePlaylist(dialogStore.playlistId).then(() => {
      dialogStore.close();
      notification({ msg: `Playlist supprimée`, type: NotificationType.Success });
    });
  }
}
</script>

<style lang="scss" scoped>
.wrap {
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
  min-height: 5rem;
  resize: vertical;
}

.input,
.textarea {
  background-color: var(--bg-color-lighter);
  border: none;
  border-radius: 0.4rem;
  color: var(--font-color);
  font-weight: bold;
  outline: 0;
  padding: 0.8rem 1rem;
  transition: 0.2s;
  width: 100%;

  &:focus {
    box-shadow: 0 0 0 0.1rem var(--primary-color);
  }
}
</style>
