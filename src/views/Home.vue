<template>
  <div class="home overflowed">
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

    return { store };
  },
});
</script>

<style lang="scss" scoped>
.home {
  padding: 20px;
  line-break: anywhere;
}
</style>
