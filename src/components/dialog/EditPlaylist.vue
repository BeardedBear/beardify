<template>
  <Dialog with-title :title="`Editer une ${isCollection ? 'collection' : 'playlist'}`">
    <div v-if="values.name === ''" class="loading"><Loading /></div>
    <div v-else class="wrap">
      <div>
        <div class="section">
          <label for="name">Nom</label>
          <input v-if="isEditable" id="name" v-model="values.name" class="input" type="text" />
          <div v-else>{{ values.name }}</div>
        </div>
        <div class="section">
          <label for="description">Description</label>
          <textarea
            v-if="isEditable"
            id="description"
            v-model="values.description"
            placeholder="Add description"
            class="textarea"
          ></textarea>
          <div v-else>{{ values.description }}</div>
        </div>
        <div v-if="isEditable" class="option-list section">
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
        <button class="button button" @click="remove()">
          Supprimer la {{ isCollection ? "collection" : "playlist" }}
        </button>
        <button
          v-if="isEditable"
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
import { useAuth } from "../../views/auth/AuthStore";
import Loading from "../LoadingDots.vue";
import { useSidebar } from "../sidebar/SidebarStore";
import Dialog from "./Dialog.vue";
import { useDialog } from "./DialogStore";

const dialogStore = useDialog();
const sidebarStore = useSidebar();
const values: UpdatePlaylistValues = reactive({ name: "", collaborative: false, description: "", public: false });
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
    sidebarStore.removePlaylist(dialogStore.playlistId).then(() => {
      dialogStore.close();
      notification({ msg: `Playlist supprimée`, type: NotificationType.Success });
    });
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
