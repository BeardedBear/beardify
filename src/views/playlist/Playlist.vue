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
import { defineComponent, ref } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import { timecode } from "../../helpers/date";
import { playSongs } from "../../helpers/play";
import { PlaylistActions, Mutations } from "./PlaylistStore";

export default defineComponent({
  props: {
    id: { default: "", type: String }
  },
  setup(props) {
    const store = useStore<RootState>();
    const playlistpage = ref();

    store.dispatch(`playlist/${PlaylistActions.getPlaylist}`, `https://api.spotify.com/v1/playlists/${props.id}`);
    store.dispatch(`playlist/${PlaylistActions.getTracks}`, `https://api.spotify.com/v1/playlists/${props.id}/tracks`);
    store.commit(`playlist/${Mutations.CLEAN_TRACKS}`);

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
