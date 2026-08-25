<template>
  <div class="sharing squircle">
    <div class="title squircle">
      <i class="share-icon icon-share" />
    </div>
    <span v-if="clipboardSpotify.copied.value" class="copied font-bold">Spotify URL copied</span>
    <span v-if="clipboardBeardify.copied.value" class="copied font-bold">Beardify URL copied</span>
    <div class="content">
      <ButtonIndex no-default-class class="copy" @click="clipboardSpotify.copy()">
        <i class="icon-spotify" />
      </ButtonIndex>
      <ButtonIndex v-if="beardifyUrl" no-default-class class="copy" @click="clipboardBeardify.copy()">
        <i class="icon-beardify" />
      </ButtonIndex>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useClipboard } from "@vueuse/core";

import ButtonIndex from "@/components/ui/ButtonIndex.vue";

const props = defineProps<{
  beardifyUrl?: string;
  spotifyUrl: string;
}>();
const clipboardSpotify = useClipboard({ source: props.spotifyUrl });
const clipboardBeardify = useClipboard({
  source: window.location.origin + props.beardifyUrl,
});
</script>

<style scoped>

.sharing {
  --sharing-radius: 1rem;

  background-color: var(--bg-color);
  border: 0.05rem solid var(--bg-color-light);
  border-radius: var(--sharing-radius);
  display: flex;
  height: 2.25rem;
  position: relative;
}

.title {
  align-items: center;
  background-color: var(--bg-color-light);
  border-radius: var(--sharing-radius) 0 0 var(--sharing-radius);
  display: flex;
}

.share-icon {
  font-size: var(--font-size-sm);
  opacity: 0.2;
  padding: 0.3rem 0.7rem 0.3rem 0.5rem;
}

.copy {
  background-color: transparent;
  border: none;
  color: var(--font-color);
  cursor: pointer;
  font-size: var(--font-size-lg);
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
  font-size: var(--font-size-sm);
  left: 50%;
  margin-right: 0.8rem;
  opacity: 0.5;
  position: absolute;
  top: calc(100% + 1rem);
  transform: translate(-50%, -50%);
  white-space: nowrap;
}
</style>
