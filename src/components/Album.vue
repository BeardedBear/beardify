<template>
  <div class="album">
    <img class="img" :src="album.images[1].url" alt="" />
    <div class="name">{{ album.name }}</div>
    <div class="date">{{ album.release_date.split("-").shift() }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { useStore } from "vuex";
import { AlbumSimplified, defaultAlbumSimplified } from "../@types/Artist";
import { RootState } from "../@types/rootStore";

export default defineComponent({
  props: {
    album: { default: defaultAlbumSimplified, type: Object as PropType<AlbumSimplified> }
  },
  setup() {
    const store = useStore<RootState>();

    return { store };
  }
});
</script>

<style lang="scss" scoped>
@keyframes popAlbum {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.album {
  animation: popAlbum 1s ease both;
}
.img {
  width: 100%;
  border-radius: 4px;
}

.name {
  margin: 3px 0;
}

.date {
  font-style: italic;
  opacity: 0.3;
  font-size: 0.8rem;
}
</style>
