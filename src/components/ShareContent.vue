<template>
  <div class="sharing">
    <div class="title"><i class="share-icon icon-share"></i></div>
    <span v-if="clipboardSpotify.copied.value" class="copied">Spotify URL copied</span>
    <span v-if="clipboardBeardify.copied.value" class="copied">Beardify URL copied</span>
    <div class="content">
      <button class="copy" @click="clipboardSpotify.copy()">
        <i class="icon-spotify"></i>
      </button>
      <button class="copy" @click="clipboardBeardify.copy()">
        <i class="icon-beardify"></i>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
import { useClipboard } from "@vueuse/core";
const props = defineProps<{ spotifyUrl: string; beardifyUrl: string }>();
const clipboardSpotify = useClipboard({ source: props.spotifyUrl });
const clipboardBeardify = useClipboard({ source: window.location.origin + props.beardifyUrl });
</script>

<style lang="scss" scoped>
$radius: 0.3rem;

.sharing {
  background-color: var(--bg-color);
  border: 0.05rem solid var(--bg-color-light);
  border-radius: $radius;
  display: flex;
  height: 2.2rem;
  position: relative;
}

.title {
  align-items: center;
  background-color: var(--bg-color-light);
  border-radius: $radius - 0.1rem 0 0 $radius - 0.1rem;
  display: flex;
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
  opacity: 0.3;
  padding: 0 0.5rem;
  transition: 0.2s;

  &:hover {
    opacity: 0.5;
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
