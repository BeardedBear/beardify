<template>
  <div class="overflowed content">
    <div class="overflowed__target">
      <div
        class="collection"
        v-for="(playlist, index) in store.state.sidebar.playlists.filter(p =>
          p.name.toLowerCase().includes('#collection')
        )"
        :key="index"
        @click="add(store.state.dialog.albumId ? store.state.dialog.albumId : '', playlist.id)"
      >
        <div class="album"><i class="icon-folder"></i>{{ playlist.name.replace("#Collection ", "") }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { Paging } from "../../@types/Paging";
import { RootState } from "../../@types/RootState";
import { TrackSimplified } from "../../@types/Track";
import { instance } from "../../api";
import { Mutations } from "./DialogStore";

export default defineComponent({
  setup() {
    const store = useStore<RootState>();

    function add(albumId: string, playlistId: string) {
      instance.get<Paging<TrackSimplified>>(`https://api.spotify.com/v1/albums/${albumId}/tracks`).then(e => {
        instance
          .post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?uris=${e.data.items[0].uri}`)
          .then(f => {
            if (f.status === 201) store.commit(`dialog/${Mutations.CLOSE}`);
          });
      });
    }

    return { add, store };
  }
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.content {
  height: 400px;
  width: 400px;
}

.album {
  display: flex;
  gap: 10px;
  align-items: center;

  i {
    opacity: 0.3;
  }
}

.collection {
  padding: 10px 25px;
  cursor: pointer;

  &:hover {
    background: var(--bg-color-light);
  }
}
</style>
