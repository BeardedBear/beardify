<template>
  <router-link :to="`/podcasts/${id}`">
    <img :src="covers[2].url" alt="" />
    <div>{{ name }}</div>
  </router-link>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
import { Image } from "../../@types/Image";

defineProps<{
  covers: Image[];
  name: string;
  id: string;
}>();
</script>
