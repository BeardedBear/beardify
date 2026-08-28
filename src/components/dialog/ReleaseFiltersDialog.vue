<template>
  <Dialog title="Filters" width="min(94vw, 24rem)" with-title max-height="80vh">
    <div class="wrap">
      <ReleaseSide />
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import Dialog from "@/components/dialog/DialogWrap.vue";
import ReleaseSide from "@/components/releases/ReleaseSide.vue";
</script>

<style scoped>
.wrap {
  max-height: 60vh;
  overflow-y: auto;
  padding-block-end: var(--bd-space-5);
}
</style>
