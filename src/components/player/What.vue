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

<script setup lang="ts">
import { useStore } from "vuex";
import type { RootState } from "../../@types/RootState";
import ArtistList from "../ArtistList.vue";
import Cover from "../Cover.vue";

const store = useStore<RootState>();
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
  font-weight: 700;
  text-decoration: none;
  color: currentColor;
}
.album {
  opacity: 0.5;
  font-style: italic;
}
.what {
  display: flex;
  align-items: center;

  img {
    height: 50px;
    margin-right: 15px;
  }
}
</style>
