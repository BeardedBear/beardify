<template>
  <div class="album">
    <img class="img" :src="album.images[1].url" alt="" />
    <div>{{ album.name }}</div>
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
.img {
  width: 100%;
  border-radius: 4px;
}
</style>
