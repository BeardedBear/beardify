<template>
  <Dialog :with-title="false" big>
    <Search />
  </Dialog>
</template>

<script lang="ts" setup>
import Search from "@/components/search/SearchIndex.vue";
import Dialog from "@/components/dialog/DialogWrap.vue";
</script>
