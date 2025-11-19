<template>
  <img :src="images[2].url" loading="lazy" v-if="size === 'small' && images.length >= 3" />
  <img :src="images[1].url" loading="lazy" v-else-if="size === 'medium' && images.length >= 2" />
  <img :src="images[0].url" loading="lazy" v-else-if="size === 'large' && images.length >= 1" />
  <img src="/img/default.png" loading="lazy" v-else />
</template>

<script lang="ts" setup>
import { Image, ImageSize } from "@/@types/Image";

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
