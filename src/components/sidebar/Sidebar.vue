<template>
  <div class="sidebar">
    <div class="overflowed">
      <div class="overflowed__target">
        <div class="sidebar__item">
          <div class="heading title">Collections</div>
          <div
            v-for="(playlist, index) in store.state.sidebar.playlists.filter((p) =>
              p.name.toLowerCase().includes('#collection')
            )"
            :key="index"
          >
            <router-link
              v-if="playlist.id"
              class="playlist-item"
              :to="`/collection/${playlist.id}`"
              :class="{ active: $route.params.id === playlist.id }"
            >
              <i class="icon-folder" />
              <div>{{ playlist.name.replace("#Collection ", "").replace("#collection ", "") }}</div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
    <div class="overflowed">
      <div class="overflowed__target">
        <div>
          <div class="heading title">Playlists</div>
          <div
            v-for="(playlist, index) in store.state.sidebar.playlists.filter(
              (p) => !p.name.toLowerCase().includes('#collection')
            )"
            :key="index"
          >
            <router-link
              v-if="playlist.id"
              class="playlist-item"
              :to="`/playlist/${playlist.id}`"
              :class="{ active: $route.params.id === playlist.id }"
            >
              <i class="icon-music" />
              <div>{{ playlist.name }}</div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import { SidebarActions } from "./SidebarStore";

export default defineComponent({
  setup() {
    const store = useStore<RootState>();

    store.dispatch(`sidebar/${SidebarActions.getPlaylists}`, "https://api.spotify.com/v1/me/playlists?limit=50");

    return { store };
  },
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.playlist-item {
  padding: 5px 15px;
  color: currentColor;
  text-decoration: none;
  display: flex;
  align-items: center;

  &:hover {
    background-color: rgba(rgb(74, 75, 103), 0.15);
  }

  i {
    opacity: 0.3;
    margin-right: 10px;
  }
}

.sidebar {
  background: var(--bg-color-dark);
  display: grid;
  grid-template-rows: 1fr 1fr;

  &__item {
    position: relative;
  }
}

.title {
  position: sticky;
  top: 0;
  padding: 10px 15px;
  background-color: var(--bg-color-dark);
  z-index: 1;
  margin: 0;
}
</style>
