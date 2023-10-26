<template>
  <div :class="{ 'wrap-current': index === undefined }">
    <div :class="{ current: index === undefined }" class="track">
      <img :src="coverUrl" class="cover" />
      <div>
        <div>
          <template v-if="index !== undefined">{{ index + 1 }}.</template>
          {{ track.name.length > 20 ? track.name.substring(0, 20) + "..." : track.name }}
        </div>
        <div><ArtistList :artist-list="track.artists" feat /></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ArtistList from "../../artist/ArtistList.vue";

defineProps<{
  coverUrl: string;
  index?: number;
  track: Spotify.Track;
}>();
</script>

<style lang="scss" scoped>
.track {
  align-items: center;
  display: flex;
  gap: 10px;
  padding: 7px 10px;

  &.current {
    $o: 10px;

    background-color: var(--bg-color);
    border: 1px solid var(--bg-color-light);
    border-radius: 10px;
    padding: 5px 7px;
  }

  .cover {
    $s: 35px;

    border-radius: 5px;
    height: $s;
    width: $s;
  }
}

.wrap-current {
  background-image: linear-gradient(to bottom, var(--bg-color-dark), var(--bg-color-darker), rgb(0 0 0 / 0%));
  padding: 10px;
  position: sticky;
  top: 0;
  z-index: 3;
}
</style>
