<template>
  <!--
    A fixed height, not a cap: results arrive after the dialog is open, so a
    content-driven panel is a thin strip on open and jumps once the first
    response lands, under a reader who is still typing. `max-height` cannot fix
    that — a ceiling is not a floor.

    Sized as a palette, not a browser: this is a jump-to tool used mid-listen,
    dozens of times a day, and at 90dvh x 90dvw it blanked the discography you
    opened it to compare against. But `big` alone (56rem) is too narrow for
    three columns carrying album art, so the width is set explicitly rather than
    left to the preset.
  -->
  <Dialog height="min(60rem, 82dvh)" title="Search" width="min(94vw, 80rem)" with-title>
    <Search />
  </Dialog>
</template>

<script lang="ts" setup>
import Dialog from "@/components/dialog/DialogWrap.vue";
import Search from "@/components/search/SearchIndex.vue";
</script>
