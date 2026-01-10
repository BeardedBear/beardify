<template>
  <Dialog :with-title="false" big>
    <Search />
  </Dialog>
</template>

<script lang="ts" setup>
import Dialog from "@/components/dialog/DialogWrap.vue";
import Search from "@/components/search/SearchIndex.vue";
</script>
