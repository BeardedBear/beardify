<template>
  <img v-if="size === 'small' && images.length >= 3" :class="className" :src="images[2].url" loading="lazy" />
  <img v-else-if="size === 'medium' && images.length >= 2" :class="className" :src="images[1].url" loading="lazy" />
  <img v-else-if="size === 'large' && images.length >= 1" :class="className" :src="images[0].url" loading="lazy" />
  <img v-else :class="className" src="/img/default.png" />
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
import { Image, ImageSize } from "../@types/Image";

defineProps<{
  images: Image[];
  size: ImageSize;
  className?: string;
}>();
</script>

<style lang="scss" scoped>
.img {
  aspect-ratio: 1 / 1;
  border-radius: 4px;
  cursor: pointer;
  display: block;
  width: 100%;
}
</style>
