<template>
  <div class="content">
    <div
      v-for="(playlist, index) in store.state.sidebar.playlists.filter((p) =>
        p.name.toLowerCase().includes('#collection'),
      )"
      :key="index"
      class="collection"
      @click="add(dialogStore.albumId ? dialogStore.albumId : '', playlist.id)"
    >
      <div class="album"><i class="icon-folder" />{{ playlist.name.replace("#Collection ", "") }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useStore } from "vuex";
import { Paging } from "../../@types/Paging";
import { RootState } from "../../@types/RootState";
import { TrackSimplified } from "../../@types/Track";
import { instance } from "../../api";
import { useDialog } from "./DialogStore";

const store = useStore<RootState>();
const dialogStore = useDialog();

function add(albumId: string, playlistId: string): void {
  instance()
    .get<Paging<TrackSimplified>>(`albums/${albumId}/tracks`)
    .then((e) => {
      instance()
        .post(`playlists/${playlistId}/tracks?uris=${e.data.items[0].uri}`)
        .then((f) => {
          if (f.status === 201) dialogStore.close();
        });
    });
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.content {
  height: 400px;
  overflow: auto;
  width: 400px;
}

.album {
  align-items: center;
  display: flex;

  i {
    margin-right: 10px;
    opacity: 0.3;
  }
}

.collection {
  cursor: pointer;
  padding: 10px 25px;

  &:hover {
    background: var(--bg-color-light);
  }
}
</style>
