<template>
  <div>
    <button
type="button"
      class="link"
      @click="openLink(`https://www.google.com/search?q=${album.label}+label`)"
    >
      {{ album.label }}
    </button>
    <div class="mentions">
      {{ album.copyrights[0].text }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Album } from "@/@types/Album";
import { openLink } from "@/helpers/openLink";

defineProps<{ album: Album }>();
</script>

<style scoped>

.mentions {
  color: var(--bd-font-color-dark);
}

.link {
  background-color: transparent;
  border: 0;
  color: var(--bd-font-color-dark);
  cursor: pointer;
  font: inherit;
  padding: var(--bd-space-2);
  padding-left: 0;

  &:hover {
    color: var(--bd-primary);
    opacity: 1;
  }
}
</style>
