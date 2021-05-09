<template>
  <div ref="playlistpage" class="overflowed">
    <div class="playlist-page overflowed__target">
      {{ id }}

      <div class="title">{{ store.state.playlist.playlist.name }}</div>
      <!-- <div>{{ store.state.playlist.tracks }}</div> -->
      <div v-for="(track, index) in store.state.playlist.tracks" :key="index">
        {{ track.track.name }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUpdate, onMounted, onUnmounted, onUpdated, ref } from "vue";
import { onBeforeRouteUpdate, useRoute } from "vue-router";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import { timecode } from "../../helpers/date";
import { playSongs } from "../../helpers/play";
import router from "../../router";
import { PlaylistActions, Mutations } from "./PlaylistStore";

export default defineComponent({
  props: {
    id: { default: "", type: String }
  },
  setup() {
    const store = useStore<RootState>();
    const playlistpage = ref();

    // onUpdated(() => {
    //   router.go(1);
    // });

    // onUpdated
    // onBeforeUpdate(() => {
    //   store.dispatch(
    //     `playlist/${PlaylistActions.getPlaylist}`,
    //     `https://api.spotify.com/v1/playlists/${useRoute().params.id}`
    //   );
    //   store.dispatch(
    //     `playlist/${PlaylistActions.getPlaylistTracks}`,
    //     `https://api.spotify.com/v1/playlists/${useRoute().params.id}/tracks`
    //   );
    // });

    store.dispatch(
      `playlist/${PlaylistActions.getPlaylist}`,
      `https://api.spotify.com/v1/playlists/${useRoute().params.id}`
    );
    store.dispatch(
      `playlist/${PlaylistActions.getPlaylistTracks}`,
      `https://api.spotify.com/v1/playlists/${useRoute().params.id}/tracks`
    );
    store.commit(`playlist/${Mutations.CLEAN_TRACKS}`);
    onMounted(() => {});

    return { playlistpage, store, timecode, playSongs };
  }
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

.overflowed {
  scroll-behavior: smooth;
}

// .album-header {
//   text-align: center;
//   margin-bottom: 60px;
// }

.title {
  font-size: 2rem;
  font-weight: 100;
  margin-bottom: 5px;
}

// .cover {
//   width: 100%;
// }

// .track {
//   padding: 5px 10px;
//   cursor: pointer;
//   border-radius: 3px;
//   display: grid;
//   grid-template-columns: 30px 1fr auto;

//   &:hover {
//     background-color: rgba($primary-color, 0.1);
//   }

//   &--active {
//     background-color: rgba($primary-color, 0.2);
//     color: $primary-color;

//     &:hover {
//       background-color: rgba($primary-color, 0.2);
//       color: $primary-color;
//     }
//   }

//   &__number {
//     font-style: italic;
//     opacity: 0.5;
//   }
// }

// .content {
//   display: flex;
//   justify-content: center;
//   gap: 30px;

//   &__cover {
//     flex: 0 0 300px;
//   }

//   &__tracks {
//     flex: 0.8;
//     font-size: 1rem;
//   }
// }

.album-page {
  padding: 30px 40px;
}
</style>
