<template>
  <div v-if="store.state.player.currentlyPlaying.item.album" class="what">
    <router-link :to="`/album/${store.state.player.currentlyPlaying.item.album.id}`">
      <Cover size="small" :images="store.state.player.currentlyPlaying.item.album.images" class-name="cover" />
    </router-link>
    <div>
      <div>
        <ArtistList :artist-list="store.state.player.currentlyPlaying.item.album.artists" />
        ·
        <span class="trackname">{{ store.state.player.currentlyPlaying.item.name }}</span>
      </div>
      <div class="album">
        {{ store.state.player.currentlyPlaying.item.album.name }}
      </div>
    </div>
  </div>
  <div v-else></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import ArtistList from "../ArtistList.vue";
import Cover from "../Cover.vue";

export default defineComponent({
  components: { ArtistList, Cover },
  setup() {
    const store = useStore<RootState>();

    return { store };
  },
});
</script>

<style lang="scss" scoped>
.cover {
  border-radius: 4px;
  display: block;
}

.trackname {
  font-style: italic;
}

.artistname {
  color: currentColor;
  font-weight: 700;
  text-decoration: none;
}
.album {
  font-style: italic;
  opacity: 0.5;
}
.what {
  align-items: center;
  display: flex;

  img {
    height: 50px;
    margin-right: 15px;
  }
}
</style>
