<template>
  <div class="meta">
    <What />
    <Controls />
    <Device />
  </div>
  <!-- <Loader v-else /> -->
  <SeekBar />
</template>

<script lang="ts" setup>
import Controls from "./PlayerControls.vue";
import What from "./PlayerMetas.vue";
import SeekBar from "./SeekBar.vue";
import Device from "./device/DeviceIndex.vue";
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.meta {
  align-items: center;
  display: flex;

  // grid-template-columns: 1fr auto 1fr;
  justify-content: space-between;
  padding: 0.9rem 1.2rem 0.5rem;
}

.options {
  text-align: right;
}
</style>
