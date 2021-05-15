<template>
  <div v-if="env === 'production'">Coucou c'est l'accueil, pour le moment y'a rien, mais t'inquiète ca va venir.</div>
  <div v-else class="home overflowed">
    <div class="overflowed__target">
      <b>This device id</b> :
      <pre>{{ store.state.player.thisDeviceId }}</pre>
      <br /><br />
      <b>Active device</b> :
      <pre>{{ store.state.player.devices.activeDevice }}</pre>
      <br /><br />
      <b>List device</b> :
      <pre>{{ store.state.player.devices.list }}</pre>
      <br /><br />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import type { RootState } from "../@types/RootState";

export default defineComponent({
  setup() {
    const store = useStore<RootState>();
      const env = process.env.NODE_ENV

    return { store ,env};
  },
});
</script>

<style lang="scss" scoped>
.home {
  padding: 20px;
  line-break: anywhere;
}
</style>
