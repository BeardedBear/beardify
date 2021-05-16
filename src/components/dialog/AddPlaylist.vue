<template>
  <div>vas y créé une playlist !</div>
  <input v-model="playlistName" type="text" />
  <button @click="create()">GO</button>
  {{ playlistName }}
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import { SidebarActions } from "../sidebar/SidebarStore";

export default defineComponent({
  setup() {
    const store = useStore<RootState>();
    const playlistName = ref("");

    function create() {
      store.dispatch(`sidebar/${SidebarActions.add}`, playlistName.value);
    }

    return { playlistName, create, store };
  },
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";
</style>
