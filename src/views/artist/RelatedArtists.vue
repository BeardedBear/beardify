<template>
  <div>
    <div class="heading">Artistes similaires</div>
    <div class="list">
      <router-link
        class="item"
        v-for="(artist, _, index) in store.state.artist.relatedArtists.artists"
        :key="index"
        :to="`/artist/${artist.id}`"
      >
        <Cover size="small" :images="artist.images" className="image" />
        <div class="name">{{ artist.name }}</div>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import { timecode } from "../../helpers/date";
import Cover from "../../components/Cover.vue";

export default defineComponent({
  components: { Cover },
  setup() {
    const store = useStore<RootState>();
    return { store, timecode };
  }
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.image {
  $size: 50px;
  width: $size;
  height: $size;
  border-radius: $size;
  margin-bottom: 5px;
}

.item {
  text-align: center;
  font-size: 0.8rem;
  padding: 10px;
  border-radius: 3px;
  cursor: pointer;
  text-decoration: none;
  color: currentColor;

  &:hover {
    background-color: $bg-color-light;
  }
}

.list {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
}
</style>
