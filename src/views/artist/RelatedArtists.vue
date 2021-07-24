<template>
  <div v-if="store.state.artist.relatedArtists.artists.length">
    <div class="heading sticky-heading">Artistes similaires</div>
    <div class="list">
      <router-link
        v-for="(artist, index) in store.state.artist.relatedArtists.artists"
        :key="index"
        class="item"
        :to="`/artist/${artist.id}`"
      >
        <Cover size="small" :images="artist.images" class-name="image" />
        <div class="name">
          {{ artist.name }}
        </div>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import Cover from "../../components/Cover.vue";

export default defineComponent({
  components: { Cover },
  setup() {
    const store = useStore<RootState>();
    return { store };
  },
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.image {
  $size: 50px;
  border-radius: $size;
  height: $size;
  margin-bottom: 5px;
  width: $size;
}

.item {
  border-radius: 3px;
  color: currentColor;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 10px;
  text-align: center;
  text-decoration: none;

  &:hover {
    background-color: rgba(rgb(74, 75, 103), 0.15);
  }
}

.list {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
</style>
