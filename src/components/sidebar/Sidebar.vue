<template>
  <div class="sidebar">
    <router-link class="artistname" to="/artist/31u3refS0tKDq8JFs4rgVx"> Luna Sol </router-link>
    <br />
    <router-link class="artistname" to="/artist/6xPOeIDWmM9ooOw7SBknMl">
      The Night Flight Orchestra
    </router-link>

    <div v-for="(playlist, index) in store.state.sidebar.playlists" :key="index">
      {{ playlist.name }}
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

.sidebar {
  background: $bg-color-dark;
  padding: 30px;
  // temp
  overflow: auto;
  height: 76%;
}
</style>
