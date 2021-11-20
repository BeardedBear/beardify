<template>
  <div v-if="playerStore.currentlyPlaying.item.album" class="what">
    <router-link :to="`/album/${playerStore.currentlyPlaying.item.album.id}`">
      <Cover size="small" :images="playerStore.currentlyPlaying.item.album.images" class-name="cover" />
    </router-link>
    <div>
      <div>
        <ArtistList :artist-list="playerStore.currentlyPlaying.item.album.artists" />
        ·
        <span class="trackname">{{ playerStore.currentlyPlaying.item.name }}</span>
      </div>
      <div class="album">
        {{ playerStore.currentlyPlaying.item.album.name }}
      </div>
    </div>
  </div>
  <div v-else></div>
</template>

<script lang="ts" setup>
import Cover from "../Cover.vue";
import ArtistList from "../ArtistList.vue";
import { usePlayer } from "./PlayerStore";

const playerStore = usePlayer();
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
  opacity: 50%;
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
