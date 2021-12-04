<template>
  <div>
    <a class="link" @click="openLink(`https://www.google.com/search?q=${album.label}+label`)">{{ album.label }}</a>
    <div class="mentions">{{ album.copyrights[0].text }}</div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
import { Album } from "../../@types/Album";

defineProps<{ album: Album }>();

function openLink(url: string): void {
  window.open(url, "_blank");
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

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
