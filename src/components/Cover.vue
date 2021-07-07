<template>
  <img v-if="size === 'small' && images.length >= 3" :class="className" :src="images[2].url" loading="lazy" />
  <img v-else-if="size === 'medium' && images.length >= 2" :class="className" :src="images[1].url" loading="lazy" />
  <img v-else-if="size === 'large' && images.length >= 1" :class="className" :src="images[0].url" loading="lazy" />
  <img v-else :class="className" src="/img/default.png" />
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import { defineProps } from "vue";
import type { Image, ImageSize } from "../@types/Image";

defineProps({
  images: {
    default: () => [],
    type: Array as PropType<Image[]>,
  },
  size: {
    default: "medium",
    type: String as PropType<ImageSize>,
  },
  className: {
    default: "img",
    type: String as PropType<string>,
  },
});
</script>

<style lang="scss" scoped>
.img {
  width: 100%;
  border-radius: 4px;
  cursor: pointer;
  display: block;
  aspect-ratio: 1 / 1;
}
</style>
