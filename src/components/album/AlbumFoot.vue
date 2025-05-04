<template>
  <div>
    <a @click="openLink(`https://www.google.com/search?q=${album.label}+label`)" class="link">{{ album.label }}</a>
    <div class="mentions">{{ album.copyrights[0].text }}</div>
  </div>
</template>

<script lang="ts" setup>
import { Album } from "../../@types/Album";

defineProps<{ album: Album }>();

function openLink(url: string): void {
  window.open(url, "_blank");
}
</script>

<style lang="scss" scoped>
@use "../../assets/scss/colors" as colors;
@use "../../assets/scss/responsive" as responsive;

.mentions {
  opacity: 0.3;
}

.link {
  cursor: pointer;

  &:hover {
    color: var(--primary-color);
  }
}
</style>
