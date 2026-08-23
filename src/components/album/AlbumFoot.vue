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
  color: var(--font-color-dark);
}

.link {
  background-color: transparent;
  border: 0;
  color: var(--font-color-dark);
  cursor: pointer;
  font: inherit;
  padding: 0.5rem 0.6rem;
  padding-left: 0;

  &:hover {
    color: var(--primary-color);
    opacity: 1;
  }
}
</style>
