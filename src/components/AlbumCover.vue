<template>
  <img v-if="size === 'small' && images.length >= 3" :src="images[2].url" />
  <img v-else-if="size === 'medium' && images.length >= 2" :src="images[1].url" />
  <img v-else-if="size === 'large' && images.length >= 1" :src="images[0].url" />
  <img v-else src="/img/default.png" />
</template>

<script lang="ts" setup>
import { Image, ImageSize } from "../@types/Image";

defineProps<{
  images: Image[];
  size: ImageSize;
}>();
</script>

<style lang="scss" scoped>
.img {
  aspect-ratio: 1 / 1;
  border-radius: 0.4rem;
  cursor: pointer;
  display: block;
  transition: 0.3s;
  width: 100%;
}
</style>
