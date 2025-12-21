<template>
  <Dialog title="Artist options" with-title>
    <div class="wrap">
      <ArtistOptions />
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import ArtistOptions from "@/components/artist/ArtistOptions.vue";
import Dialog from "@/components/dialog/DialogWrap.vue";
</script>

<style lang="scss" scoped>
.wrap {
  display: flex;
  justify-content: center;
  padding: 1.5rem;

  :deep(.options) {
    flex-direction: column;
    width: 100%;
  }

  :deep(.follow) {
    width: 100%;
  }
}
</style>
