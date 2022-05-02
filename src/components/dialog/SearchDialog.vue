<template>
  <Dialog :with-title="false" big>
    <Search />
  </Dialog>
</template>

<script lang="ts" setup>
import Search from "../search/SearchIndex.vue";
import Dialog from "./DialogWrap.vue";
</script>
