<template>
  <div class="about">
    azdzad
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const store = useStore<RootState>();
    const playlist = useStore<RootState>().state.player.playlist;
    return { store, playlist };
  }
});
</script>
