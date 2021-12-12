<template>
  <Dialog :with-title="false" big>
    <Search />
  </Dialog>
</template>

<script lang="ts" setup>
import Search from "../search/Search.vue";
import Dialog from "./Dialog.vue";
</script>
