<template>
  <div class="sharing">
    <div class="title"><i class="share-icon icon-share"></i></div>
    <span class="copied" v-if="clipboardSpotify.copied.value">Spotify URL copied</span>
    <span class="copied" v-if="clipboardBeardify.copied.value">Beardify URL copied</span>
    <div class="content">
      <ButtonIndex no-default-class class="copy" @click="clipboardSpotify.copy()">
        <i class="icon-spotify"></i>
      </ButtonIndex>
      <ButtonIndex no-default-class class="copy" @click="clipboardBeardify.copy()" v-if="beardifyUrl">
        <i class="icon-beardify"></i>
      </ButtonIndex>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useClipboard } from "@vueuse/core";

import ButtonIndex from "./ButtonIndex.vue";

const props = defineProps<{
  beardifyUrl?: string;
  spotifyUrl: string;
}>();
const clipboardSpotify = useClipboard({ source: props.spotifyUrl });
const clipboardBeardify = useClipboard({
  source: window.location.origin + props.beardifyUrl,
});
</script>

<style lang="scss" scoped>
@use "../assets/scss/mixins" as mixins;

$radius: 1rem;

.sharing {
  background-color: var(--bg-color);
  border: 0.05rem solid var(--bg-color-light);
  border-radius: $radius;
  display: flex;
  height: 2.25rem;
  position: relative;

  @include mixins.squircle;
}

.title {
  align-items: center;
  background-color: var(--bg-color-light);
  border-radius: $radius 0 0 $radius;
  display: flex;

  @include mixins.squircle;
}

.share-icon {
  font-size: 0.8rem;
  opacity: 0.2;
  padding: 0.3rem 0.7rem 0.3rem 0.5rem;
}

.copy {
  background-color: transparent;
  border: none;
  color: var(--font-color);
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  opacity: 0.5;
  padding: 0 0.5rem;
  transition: 0.2s;

  &:hover {
    opacity: 1;
  }

  &:active {
    opacity: 1;
  }
}

.content {
  align-items: center;
  display: flex;
  padding: 0 0.3rem 0 0.2rem;
}

@keyframes pop {
  from {
    opacity: 0;
    transform: translate(-50%, -70%);
  }

  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

.copied {
  animation: pop 0.2s ease both;
  font-size: 0.8rem;
  font-weight: bold;
  left: 50%;
  margin-right: 0.8rem;
  opacity: 0.5;
  position: absolute;
  top: calc(100% + 1rem);
  transform: translate(-50%, -50%);
  white-space: nowrap;
}
</style>
