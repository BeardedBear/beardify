<template>
  <!--
    A fixed height, not a cap. Results arrive after the dialog is open, so a
    content-driven panel is a thin strip on open and jumps once the first
    response lands — under a reader who is still typing. `max-height` could not
    fix that: a ceiling is not a floor. Held still here, the four result columns
    scroll inside instead.
  -->
  <Dialog big height="90dvh" title="Search" width="90dvw" with-title>
    <Search />
  </Dialog>
</template>

<script lang="ts" setup>
import Dialog from "@/components/dialog/DialogWrap.vue";
import Search from "@/components/search/SearchIndex.vue";
</script>
