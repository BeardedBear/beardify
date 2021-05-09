<template>
  <div class="sidebar">
    <div class="overflowed">
      <div class="overflowed__target">
        <div
          v-for="(playlist, index) in store.state.sidebar.playlists.filter(p =>
            p.name.toLowerCase().includes('#collection')
          )"
          :key="index"
        >
          <router-link class="playlist-item" :to="/dede/">
            <i class="icon-folder"></i>
            <div>{{ playlist.name }}</div>
          </router-link>
        </div>
      </div>
    </div>
    <div class="overflowed">
      <div class="overflowed__target">
        <div
          v-for="(playlist, index) in store.state.sidebar.playlists.filter(
            p => !p.name.toLowerCase().includes('#collection')
          )"
          :key="index"
        >
          <router-link class="playlist-item" :to="/dede/">
            <i class="icon-music"></i>
            <div>{{ playlist.name }}</div>
          </router-link>
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
  }
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.playlist-item {
  padding: 5px 10px;
  color: currentColor;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background-color: $bg-color-light;
  }

  i {
    opacity: 0.3;
  }
}

.sidebar {
  background: $bg-color-dark;
  display: grid;
  grid-template-rows: 1fr 1fr;
}
</style>
